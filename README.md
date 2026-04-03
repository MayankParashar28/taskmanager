# Task Manager API - Take-Home Assessment Solution

Welcome to my solution for the Untested API take-home assignment!

## What Was Accomplished 🚀

1. **Test Coverage & Reliability**
   - Added comprehensive unit tests for `taskService.js` and integration tests for the Express API routes.
   - **Result:** Reached **`90.5%` statement coverage** (exceeding the 80% requirement) with **33 passing tests** using `jest` and `supertest`.

2. **Bug Hunting & Fixing**
   - Discovered and resolved **6 distinct bugs** impacting core logic:
     - Fixed `pagination` offset index mapping so page 1 data isn't skipped.
     - Fixed `status filtering` which mistakenly matched partial strings (e.g., filter `do` matching `todo` and `done`).
     - Fixed a bug where marking a task as `completed` silently overwrote and altered its `priority`.
     - Blocked multiple validation loopholes (duplicate task creations, empty payload updates, and patching completed tasks).
     - Added the notably missing `GET /tasks/:id` endpoint handler.
   - Refer to the detailed **[BUG_REPORT.md](./BUG_REPORT.md)** for root-cause analysis, where the bug lived, and exact fix implementations.

3. **New Feature Built**
   - Implemented the requested `PATCH /tasks/:id/assign` endpoint.
   - Designed it with defensive validation strictly checking against blank strings, implemented `404 Not Found` verification, and supported reassignment capabilities.

4. **Additional Thoughts & Scalability**
   - Documented edge cases, codebase surprises, and important questions for a future production rollout (like race conditions and storage persistence) inside **[SUBMISSION_NOTES.md](./SUBMISSION_NOTES.md)**.

---

## Instructions to Run 🛠

**Prerequisites:** Node.js 18+

```bash
cd task-api
npm install
npm start        # runs on http://localhost:3000
```

**To Verify Tests & Coverage:**
```bash
cd task-api
npm test           # run test suite
npm run coverage   # run with coverage report
```

---

*(Below is the original assignment prompt for context)*

---

# Take-Home Assignment — The Untested API

A 2-day take-home assignment. You'll read unfamiliar code, write tests, track down bugs, and ship a small feature.

Read **[ASSIGNMENT.md](./ASSIGNMENT.md)** for the full brief before you start.

## A note on AI tools

You're welcome to use AI tools. What we're evaluating is your ability to read and reason about unfamiliar code — so your submission should reflect your own understanding, not just generated output.

Concretely:
- For each bug you report: include where in the code it lives and why it happens
- For the feature you implement: briefly explain the design decisions you made
- If something surprised you or you had to make a tradeoff, say so

## Project Structure

```
task-api/
  src/
    app.js                  # Express app setup
    routes/tasks.js         # Route handlers
    services/taskService.js # Business logic + in-memory data store
    utils/validators.js     # Input validation helpers
  tests/                    # Your tests go here
  package.json
  jest.config.js
ASSIGNMENT.md               # Full brief — read this first
```

> The data store is in-memory. It resets every time the server restarts.

## API Reference

| Method   | Path                      | Description                              |
|----------|---------------------------|------------------------------------------|
| `GET`    | `/tasks`                  | List all tasks. Supports `?status=`, `?page=`, `?limit=` |
| `POST`   | `/tasks`                  | Create a new task                        |
| `PUT`    | `/tasks/:id`              | Full update of a task                    |
| `DELETE` | `/tasks/:id`              | Delete a task (returns 204)              |
| `PATCH`  | `/tasks/:id/complete`     | Mark a task as complete                  |
| `GET`    | `/tasks/stats`            | Counts by status + overdue count         |
| `PATCH`  | `/tasks/:id/assign`       | Assign a task to a user |

### Task shape

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "pending | in-progress | completed",
  "priority": "low | medium | high",
  "dueDate": "ISO 8601 or null",
  "completedAt": "ISO 8601 or null",
  "createdAt": "ISO 8601"
}
```
