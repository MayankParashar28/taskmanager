# Bug Report

## 1. Pagination skips the first page

- Expected behavior: `GET /tasks?page=1&limit=2` should return the first two tasks.
- Actual behavior: page `1` skipped the first two tasks and started at the third record.
- How I found it: failing unit test in `tests/taskService.test.js` and integration coverage through `GET /tasks`.
- Root cause: [`task-api/src/services/taskService.js`](./task-api/src/services/taskService.js) used `page * limit` instead of `(page - 1) * limit`.
- Fix: update the offset calculation to treat page numbering as 1-based.

## 2. Status filtering matched partial strings

- Expected behavior: `GET /tasks?status=done` should return only tasks with exact status `done`, and invalid statuses should be rejected.
- Actual behavior: the service used substring matching, so filtering with values like `do` matched both `todo` and `done`.
- How I found it: failing unit test for `getByStatus` and route-level validation tests.
- Root cause: [`task-api/src/services/taskService.js`](./task-api/src/services/taskService.js) used `includes()` for status comparison and the route accepted any status string.
- Fix: compare with strict equality and validate `status` in the route before querying.

## 3. Missing `GET /tasks/:id` route

- Expected behavior: the API should support fetching a single task by id.
- Actual behavior: `GET /tasks/:id` returned `404` because no route handler existed.
- How I found it: failing integration test for single-task retrieval.
- Root cause: [`task-api/src/routes/tasks.js`](./task-api/src/routes/tasks.js) had handlers for list, create, update, delete, and complete, but no handler for a direct fetch by id.
- Fix: add a `GET /tasks/:id` route that returns `404` for unknown ids.

## 4. Completing a task changed its priority

- Expected behavior: marking a task complete should update completion state, not silently rewrite priority.
- Actual behavior: `PATCH /tasks/:id/complete` forced `priority` to `medium`.
- How I found it: failing unit and integration tests for task completion.
- Root cause: [`task-api/src/services/taskService.js`](./task-api/src/services/taskService.js) overwrote `priority` during completion.
- Fix: preserve the existing task fields and only update `status` and `completedAt`.

## 5. Missing validation for duplicate create, empty updates, and completed-task updates

- Expected behavior:
  - duplicate create requests should be rejected
  - `PUT /tasks/:id` should reject empty bodies
  - completed tasks should not be updated
- Actual behavior: all three scenarios succeeded.
- How I found it: integration tests covering the edge cases in the assignment brief.
- Root cause:
  - no duplicate check before create
  - update validation allowed `{}` bodies
  - route logic updated completed tasks without transition rules
- Fix:
  - add duplicate detection in the service and route
  - require at least one updatable field in the update validator
  - block updates when the current task status is `done`

## 6. Pagination and filter validation returned `200` for bad input

- Expected behavior: invalid `page`, `limit`, or `status` query values should return `400`.
- Actual behavior: invalid query combinations still returned `200`.
- How I found it: integration tests for `page=0`, `limit=-1`, and `status=blocked`.
- Root cause: [`task-api/src/routes/tasks.js`](./task-api/src/routes/tasks.js) parsed query values with permissive fallbacks and had no dedicated query validation.
- Fix: add explicit validation helpers and return `400` before calling the service.
