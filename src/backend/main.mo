import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type Definitions
  type TimelineEventType = {
    #sleep;
    #routine;
    #special;
    #task;
    #stats;
  };

  type TaskStatus = {
    #notStarted;
    #inProgress;
    #completed;
  };

  type RestEntry = {
    restId : Text;
    restType : Text;
    description : Text;
    timeRangeInMinutes : Text;
    percentage : Nat;
    autoCompletedTime : Bool;
    autoSaved : Bool;
  };

  type SubTaskEntry = {
    subTaskId : Text;
    description : Text;
    status : TaskStatus;
    timeEstimateInMinutes : ?Nat;
  };

  type TaskDetails = {
    taskId : Text;
    description : Text;
    restEntries : [RestEntry];
    subTasks : [SubTaskEntry];
    timeEstimateInMinutes : ?Nat;
    status : TaskStatus;
    parentTaskId : ?Text;
    allSubTasksCompleted : Bool;
  };

  type LayerEntry = {
    layerId : Text;
    layerType : Text;
    description : Text;
    timeEstimateInMinutes : ?Nat;
    subLayers : [LayerEntry];
  };

  type RoutineLayerConfig = {
    routineId : Text;
    layerConfig : LayerEntry;
  };

  type CycleSchemaEntry = {
    cycleSchemaId : Text;
    patternType : Text;
    description : Text;
    customPattern : [Bool];
    entries : [CycleSchemaEntry];
  };

  type CycleSchema = {
    cycleSchemaId : Text;
    cycleType : Text;
    description : Text;
    schemaEntries : [CycleSchemaEntry];
  };

  type TimelineEvent = {
    id : Text;
    startTime : Nat64;
    endTime : ?Nat64;
    eventType : TimelineEventType;
    details : {
      #task : TaskDetails;
      #rest : RestEntry;
      #routineLayerConfig : RoutineLayerConfig;
      #cycleSchema : CycleSchema;
    };
  };

  public type UserProfile = {
    name : Text;
    createdAt : Nat64;
  };

  module TimelineEvent {
    public func compareByStartTime(a : TimelineEvent, b : TimelineEvent) : Order.Order {
      Nat64.compare(a.startTime, b.startTime);
    };
  };

  // Persistent Storage - User-specific event storage
  let userEventStores = Map.empty<Principal, Map.Map<Text, TimelineEvent>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Build Info
  public type BuildInfo = {
    version : Text;
    backendTimestamp : Text;
  };

  // Build info is public information - no authentication required
  // This allows anyone (including guests) to check version/build info
  public query func getBuildInfo() : async BuildInfo {
    { version = "Version 8"; backendTimestamp = "202406211205"; };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper to get or create user's event store
  func getUserEventStore(user : Principal) : Map.Map<Text, TimelineEvent> {
    switch (userEventStores.get(user)) {
      case (null) {
        let newStore = Map.empty<Text, TimelineEvent>();
        userEventStores.add(user, newStore);
        newStore;
      };
      case (?store) { store };
    };
  };

  // CRUD Operations - All require user authentication
  public shared ({ caller }) func addEvent(event : TimelineEvent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add events");
    };

    let eventStore = getUserEventStore(caller);
    checkIdUniqueness(eventStore, event.id);
    eventStore.add(event.id, event);
  };

  public query ({ caller }) func getEvent(id : Text) : async TimelineEvent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };

    let eventStore = getUserEventStore(caller);
    switch (eventStore.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };
  };

  public shared ({ caller }) func updateEvent(event : TimelineEvent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update events");
    };

    let eventStore = getUserEventStore(caller);
    if (not eventStore.containsKey(event.id)) {
      Runtime.trap("Event not found");
    };
    eventStore.add(event.id, event);
  };

  public shared ({ caller }) func deleteEvent(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete events");
    };

    let eventStore = getUserEventStore(caller);
    switch (eventStore.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?_) {
        eventStore.remove(id);
      };
    };
  };

  // Queries - User-specific data only
  public query ({ caller }) func getAllEvents() : async [TimelineEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };

    let eventStore = getUserEventStore(caller);
    filterAndSortEventsMap(eventStore.entries());
  };

  public query ({ caller }) func getActiveEvents() : async [TimelineEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view events");
    };

    let eventStore = getUserEventStore(caller);
    let persistentValues = eventStore.values();
    let persistentValuesArray = persistentValues.toArray();
    let activeEvents = persistentValuesArray.filter(isActive);
    filterAndSortEvents(activeEvents.values());
  };

  // Admin function to view any user's events (for support/debugging)
  public query ({ caller }) func adminGetUserEvents(user : Principal) : async [TimelineEvent] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view other users' events");
    };

    let eventStore = getUserEventStore(user);
    filterAndSortEventsMap(eventStore.entries());
  };

  // Helper Functions
  func checkIdUniqueness(eventStore : Map.Map<Text, TimelineEvent>, id : Text) {
    assert eventStore.get(id) == null;
  };

  func filterAndSortEventsMap(entries : Iter.Iter<(Text, TimelineEvent)>) : [TimelineEvent] {
    let filteredEntries = entries.filter(
      func((id, event)) { id == event.id }
    );
    filteredEntries.map<(Text, TimelineEvent), TimelineEvent>(
      func((_, event)) { event }
    ).toArray().sort(TimelineEvent.compareByStartTime);
  };

  func filterAndSortEvents(iter : Iter.Iter<TimelineEvent>) : [TimelineEvent] {
    iter.toArray().sort(TimelineEvent.compareByStartTime);
  };

  func isActive(event : TimelineEvent) : Bool {
    switch (event.eventType) {
      case (#task) {
        switch (event.details) {
          case (#task(details)) {
            switch (details.status) {
              case (#inProgress) { return true };
              case (_) { return false };
            };
          };
          case (_) { return false };
        };
      };
      case (#rest) {
        switch (event.details) {
          case (#rest(details)) { return not details.autoCompletedTime };
          case (_) { return false };
        };
      };
      case (#stats) { return false };
      case (_) { return false };
    };
    false;
  };
};
