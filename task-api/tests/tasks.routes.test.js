const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('tasks routes', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('happy paths', () => {
    test('creates a task with POST /tasks', async () => {
      const response = await request(app).post('/tasks').send({
        title: 'Write integration tests',
        description: 'Cover endpoints',
        priority: 'high',
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'Write integration tests',
          description: 'Cover endpoints',
          status: 'todo',
          priority: 'high',
        })
      );
    });

    test('gets all tasks with GET /tasks', async () => {
      taskService.create({ title: 'One' });
      taskService.create({ title: 'Two' });

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('gets a task by id with GET /tasks/:id', async () => {
      const task = taskService.create({ title: 'Fetch me' });

      const response = await request(app).get(`/tasks/${task.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ id: task.id, title: 'Fetch me' }));
    });

    test('updates a task with PUT /tasks/:id', async () => {
      const task = taskService.create({ title: 'Before update', status: 'todo' });

      const response = await request(app).put(`/tasks/${task.id}`).send({
        title: 'After update',
        status: 'in_progress',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: task.id,
          title: 'After update',
          status: 'in_progress',
        })
      );
    });

    test('deletes a task with DELETE /tasks/:id', async () => {
      const task = taskService.create({ title: 'Delete me' });

      const response = await request(app).delete(`/tasks/${task.id}`);

      expect(response.status).toBe(204);
      expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('marks a task complete with PATCH /tasks/:id/complete', async () => {
      const task = taskService.create({ title: 'Finish me', priority: 'high' });

      const response = await request(app).patch(`/tasks/${task.id}/complete`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: task.id,
          status: 'done',
          priority: 'high',
          completedAt: expect.any(String),
        })
      );
    });

    test('gets stats with GET /tasks/stats', async () => {
      const overdueDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      taskService.create({ title: 'Todo', status: 'todo', dueDate: overdueDate });
      taskService.create({ title: 'Doing', status: 'in_progress' });
      taskService.create({ title: 'Done', status: 'done' });

      const response = await request(app).get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        todo: 1,
        in_progress: 1,
        done: 1,
        overdue: 1,
      });
    });

    test('assigns a task with PATCH /tasks/:id/assign', async () => {
      const task = taskService.create({ title: 'Needs owner' });

      const response = await request(app).patch(`/tasks/${task.id}/assign`).send({
        assignee: 'John Doe',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: task.id,
          assignee: 'John Doe',
        })
      );
    });
  });

  describe('edge cases and validations', () => {
    test('rejects missing title on create', async () => {
      const response = await request(app).post('/tasks').send({ priority: 'low' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'title is required and must be a non-empty string',
      });
    });

    test('rejects invalid status on create', async () => {
      const response = await request(app).post('/tasks').send({
        title: 'Bad status',
        status: 'blocked',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch('status must be one of');
    });

    test('rejects invalid priority on create', async () => {
      const response = await request(app).post('/tasks').send({
        title: 'Bad priority',
        priority: 'urgent',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch('priority must be one of');
    });

    test('rejects invalid dueDate format on create', async () => {
      const response = await request(app).post('/tasks').send({
        title: 'Bad date',
        dueDate: 'not-a-date',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'dueDate must be a valid ISO date string',
      });
    });

    test('returns 404 for non-existent task ids on update, delete, and complete', async () => {
      const updateResponse = await request(app).put('/tasks/missing-id').send({ title: 'Nope' });
      const deleteResponse = await request(app).delete('/tasks/missing-id');
      const completeResponse = await request(app).patch('/tasks/missing-id/complete');

      expect(updateResponse.status).toBe(404);
      expect(deleteResponse.status).toBe(404);
      expect(completeResponse.status).toBe(404);
    });

    test('validates pagination edge cases', async () => {
      taskService.create({ title: 'One' });

      const pageResponse = await request(app).get('/tasks?page=0&limit=1');
      const limitResponse = await request(app).get('/tasks?page=1&limit=-1');

      expect(pageResponse.status).toBe(400);
      expect(limitResponse.status).toBe(400);
    });

    test('rejects invalid status filtering', async () => {
      const response = await request(app).get('/tasks?status=blocked');

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch('status must be one of');
    });

    test('rejects duplicate task creation', async () => {
      await request(app).post('/tasks').send({
        title: 'Duplicate me',
        description: 'Same title and description',
      });

      const response = await request(app).post('/tasks').send({
        title: 'Duplicate me',
        description: 'Same title and description',
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: 'Task already exists',
      });
    });

    test('prevents updates to completed tasks', async () => {
      const task = taskService.create({ title: 'Locked task', status: 'done' });

      const response = await request(app).put(`/tasks/${task.id}`).send({
        title: 'Should not change',
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: 'Completed tasks cannot be updated',
      });
    });

    test('rejects empty request bodies on update', async () => {
      const task = taskService.create({ title: 'Needs content' });

      const response = await request(app).put(`/tasks/${task.id}`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Request body must include at least one updatable field',
      });
    });

    test('rejects empty assignee values and missing bodies', async () => {
      const task = taskService.create({ title: 'Assign validation' });

      const emptyResponse = await request(app).patch(`/tasks/${task.id}/assign`).send({
        assignee: '',
      });
      const missingResponse = await request(app).patch(`/tasks/${task.id}/assign`).send({});

      expect(emptyResponse.status).toBe(400);
      expect(missingResponse.status).toBe(400);
      expect(emptyResponse.body).toEqual({
        error: 'assignee is required and must be a non-empty string',
      });
    });

    test('supports reassignment', async () => {
      const task = taskService.create({ title: 'Reassign me' });

      await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: 'John Doe' });
      const response = await request(app).patch(`/tasks/${task.id}/assign`).send({
        assignee: 'Jane Doe',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ assignee: 'Jane Doe' }));
    });

    test('returns 404 when assigning a missing task', async () => {
      const response = await request(app).patch('/tasks/missing-id/assign').send({
        assignee: 'John Doe',
      });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Task not found',
      });
    });
  });
});
