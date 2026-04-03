# Submission Notes

## What I changed

- Added unit tests for `taskService` and integration tests for the API routes.
- Fixed the pagination bug by correcting the page offset calculation.
- Fixed status filtering to use exact matches and reject invalid status filters.
- Added `GET /tasks/:id`.
- Preserved task priority when marking a task complete.
- Added validation for duplicate task creation, invalid pagination, empty update bodies, and updates to completed tasks.
- Implemented `PATCH /tasks/:id/assign` with reassignment support, validation, and `404` handling.

## Verification

- `npm test -- --runInBand`
- `npm run coverage -- --runInBand`

Coverage summary from the latest run:

- Statements: `90.5%`
- Branches: `82.45%`
- Functions: `94.59%`
- Lines: `90.55%`

## What I would test next

- Concurrent request behavior against the in-memory store to understand race-condition risk under rapid updates/deletes.
- Clear status transition rules, especially whether moving from `done` back to active states should ever be allowed.
- More date-focused cases around timezone boundaries and due dates exactly equal to "now".
- Error-handling behavior for malformed JSON requests and unsupported routes.

## What surprised me

- The README and implementation were slightly out of sync on status naming and endpoint expectations.
- Several bugs were small single-line issues, but they had visible API-level impact once the tests were in place.
- `supertest` required local ephemeral port access during verification, which mattered in the sandbox.

## Questions before shipping to production

- What is the canonical task lifecycle and are status transitions constrained?
- What should define a "duplicate" task beyond title and description?
- Should assignment support unassigning a task, and if so what payload should represent that?
- Is in-memory storage acceptable only for the exercise, or is a persistence layer expected next?
