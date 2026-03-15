# Roadmap: Home Surveillance Demo

**Created:** 2026-03-15
**Project:** `.planning/PROJECT.md`
**Requirements:** `.planning/REQUIREMENTS.md`

## Phase 1: Project Skeleton And Room Join

Create the single-folder static application shell, add join/leave controls, and persist room credentials locally.

**Covers:** ROOM-01, ROOM-02

## Phase 2: Guard-Side Auto Camera Publish

Implement the guard-side flow so `client.join` success immediately opens the camera, keeps microphone disabled, shows local preview, and publishes video.

**Covers:** CAM-01, CAM-02, CAM-03

## Phase 3: Patrol-Side Remote Auto Subscribe

Implement remote event handling so viewer devices automatically subscribe to remote video and cleanly remove tiles on unpublish/leave.

**Covers:** PATROL-01, PATROL-02, PATROL-03

## Phase 4: Responsive Viewing Experience

Refine layout, spacing, and video card behavior for both desktop and mobile viewing.

**Covers:** RESP-01, RESP-02, RESP-03

## Phase 5: Packaging And Operational Notes

Ensure the app remains self-contained in one directory and document deployment caveats such as HTTPS/secure-context requirements.

**Covers:** PACK-01, PACK-02

## Phase Summary

| Phase | Focus | Requirements | Status |
|-------|-------|--------------|--------|
| 1 | Skeleton and join flow | 2 | Complete |
| 2 | Guard auto camera publish | 3 | Complete |
| 3 | Patrol auto subscribe | 3 | Complete |
| 4 | Responsive UX | 3 | Complete |
| 5 | Packaging and docs | 2 | Complete |

## Notes

This roadmap is effectively executed in the initial implementation because the requested scope is small and coherent enough to land as a single static demo.

---
*Last updated: 2026-03-15 after initial implementation*
