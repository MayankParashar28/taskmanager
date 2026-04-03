const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const UPDATABLE_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];

const isValidIsoDate = (value) => !isNaN(Date.parse(value));

const validateStatus = (status) => {
  if (!VALID_STATUSES.includes(status)) {
    return `status must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  return null;
};

const validatePagination = (page, limit) => {
  const pageNum = Number.parseInt(page, 10);
  const limitNum = Number.parseInt(limit, 10);

  if (!Number.isInteger(pageNum) || pageNum < 1) {
    return 'page must be a positive integer';
  }

  if (!Number.isInteger(limitNum) || limitNum < 1) {
    return 'limit must be a positive integer';
  }

  return null;
};

const validateAssignee = (body = {}) => {
  if (typeof body.assignee !== 'string' || body.assignee.trim() === '') {
    return 'assignee is required and must be a non-empty string';
  }
  return null;
};

const validateCreateTask = (body = {}) => {
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return 'title is required and must be a non-empty string';
  }
  if (body.status) {
    const statusError = validateStatus(body.status);
    if (statusError) return statusError;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return `priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }
  if (body.dueDate && !isValidIsoDate(body.dueDate)) {
    return 'dueDate must be a valid ISO date string';
  }
  if (body.assignee !== undefined) {
    const assigneeError = validateAssignee(body);
    if (assigneeError) return assigneeError;
  }
  return null;
};

const validateUpdateTask = (body = {}) => {
  const hasUpdatableField = UPDATABLE_FIELDS.some((field) => Object.hasOwn(body, field));
  if (!hasUpdatableField) {
    return 'Request body must include at least one updatable field';
  }
  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
    return 'title must be a non-empty string';
  }
  if (body.status) {
    const statusError = validateStatus(body.status);
    if (statusError) return statusError;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return `priority must be one of: ${VALID_PRIORITIES.join(', ')}`;
  }
  if (body.dueDate && !isValidIsoDate(body.dueDate)) {
    return 'dueDate must be a valid ISO date string';
  }
  return null;
};

module.exports = {
  VALID_STATUSES,
  validateAssignee,
  validateCreateTask,
  validatePagination,
  validateStatus,
  validateUpdateTask,
};
