# Specification

## Summary
**Goal:** Retry a clean build and promote the existing Version 8 codebase to the live (production) environment, then verify live build-info is correctly reporting Version 8 for both frontend and backend.

**Planned changes:**
- Re-run a clean build and deployment/promotion to production for the existing Version 8 codebase.
- Verify the live frontend is serving newly built assets (not stale/cached).
- Verify Settings → Build Info shows Frontend version "Version 8" and Backend version "Version 8" with no mismatch warning when they match.
- Confirm the live backend getBuildInfo() endpoint returns version "Version 8" and a non-empty backendTimestamp, and that the frontend can fetch/display it.

**User-visible outcome:** The production app loads the newly deployed Version 8 build, and Settings → Build Info correctly reports Version 8 for both frontend and backend without a false mismatch warning.
