# Specification

## Summary
**Goal:** Add an OMNIBRAIN runtime mode setting (Local vs API) that persists locally, is visible in the OMNIBRAIN UI, and keeps the app offline-only by marking API mode as unavailable.

**Planned changes:**
- Add a device-local Settings control to choose OMNIBRAIN runtime mode: “Local (Offline)” or “API (Online)”, persisted via a new localStorage key with a default to “Local (Offline)” when missing/invalid.
- Display the runtime mode selector in/near the existing “External AI (OpenAI)” Settings section, and clearly indicate that “API (Online)” is unavailable in this build (disabled and/or helper text), while keeping the “no network calls / no API keys” messaging true.
- Wire OMNIBRAIN chat behavior to the selected mode: Local mode keeps existing deterministic offline responses; API mode (unavailable) returns the existing deterministic external-AI-unavailable explanation without making any network calls.
- Surface the currently selected runtime mode on the OMNIBRAIN screen as a low-noise English label/badge, including an “unavailable” indication when API mode is selected.

**User-visible outcome:** Users can switch OMNIBRAIN between “Local (Offline)” and “API (Online)” in Settings (with API clearly shown as unavailable), see the current mode on the OMNIBRAIN screen, and have chat behavior update immediately and persist across reloads—without any new network activity.
