import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BuildInfo {
    version: string;
    backendTimestamp: string;
}
export interface RoutineLayerConfig {
    layerConfig: LayerEntry;
    routineId: string;
}
export interface RestEntry {
    restId: string;
    timeRangeInMinutes: string;
    autoSaved: boolean;
    description: string;
    restType: string;
    autoCompletedTime: boolean;
    percentage: bigint;
}
export interface LayerEntry {
    layerId: string;
    subLayers: Array<LayerEntry>;
    description: string;
    layerType: string;
    timeEstimateInMinutes?: bigint;
}
export interface CycleSchemaEntry {
    patternType: string;
    description: string;
    entries: Array<CycleSchemaEntry>;
    customPattern: Array<boolean>;
    cycleSchemaId: string;
}
export interface TimelineEvent {
    id: string;
    startTime: bigint;
    endTime?: bigint;
    details: {
        __kind__: "routineLayerConfig";
        routineLayerConfig: RoutineLayerConfig;
    } | {
        __kind__: "cycleSchema";
        cycleSchema: CycleSchema;
    } | {
        __kind__: "rest";
        rest: RestEntry;
    } | {
        __kind__: "task";
        task: TaskDetails;
    };
    eventType: TimelineEventType;
}
export interface TaskDetails {
    status: TaskStatus;
    restEntries: Array<RestEntry>;
    allSubTasksCompleted: boolean;
    description: string;
    subTasks: Array<SubTaskEntry>;
    taskId: string;
    parentTaskId?: string;
    timeEstimateInMinutes?: bigint;
}
export interface SubTaskEntry {
    status: TaskStatus;
    description: string;
    subTaskId: string;
    timeEstimateInMinutes?: bigint;
}
export interface CycleSchema {
    cycleType: string;
    description: string;
    schemaEntries: Array<CycleSchemaEntry>;
    cycleSchemaId: string;
}
export interface UserProfile {
    name: string;
    createdAt: bigint;
}
export enum TaskStatus {
    notStarted = "notStarted",
    completed = "completed",
    inProgress = "inProgress"
}
export enum TimelineEventType {
    task = "task",
    sleep = "sleep",
    stats = "stats",
    routine = "routine",
    special = "special"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEvent(event: TimelineEvent): Promise<void>;
    adminGetUserEvents(user: Principal): Promise<Array<TimelineEvent>>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEvent(id: string): Promise<void>;
    getActiveEvents(): Promise<Array<TimelineEvent>>;
    getAllEvents(): Promise<Array<TimelineEvent>>;
    getBuildInfo(): Promise<BuildInfo>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEvent(id: string): Promise<TimelineEvent>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEvent(event: TimelineEvent): Promise<void>;
}
