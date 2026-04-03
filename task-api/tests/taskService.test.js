const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create and read operations', () => {
    test('creates a task with defaults and finds it by id', () => {
      const task = taskService.create({ title: 'Write tests' });

      expect(task).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'Write tests',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: null,
          completedAt: null,
          createdAt: expect.any(String),
        })
      );
      expect(taskService.findById(task.id)).toEqual(task);
    });

    test('returns a copy from getAll', () => {
      taskService.create({ title: 'Original' });

      const tasks = taskService.getAll();
      tasks.push({ id: 'fake' });

      expect(taskService.getAll()).toHaveLength(1);
    });

    test('filters tasks by exact status', () => {
      taskService.create({ title: 'Todo item', status: 'todo' });
      taskService.create({ title: 'Done item', status: 'done' });

      expect(taskService.getByStatus('do')).toEqual([]);
      expect(taskService.getByStatus('done')).toHaveLength(1);
    });

    test('paginates from page 1', () => {
      const first = taskService.create({ title: 'First' });
      const second = taskService.create({ title: 'Second' });
      taskService.create({ title: 'Third' });

      expect(taskService.getPaginated(1, 2)).toEqual([first, second]);
    });
  });

  describe('update and delete operations', () => {
    test('updates an existing task', () => {
      const task = taskService.create({ title: 'Before', priority: 'low' });

      const updated = taskService.update(task.id, {
        title: 'After',
        status: 'in_progress',
      });

      expect(updated).toEqual(
        expect.objectContaining({
          id: task.id,
          title: 'After',
          status: 'in_progress',
          priority: 'low',
        })
      );
    });

    test('returns null when updating a missing task', () => {
      expect(taskService.update('missing-id', { title: 'Nope' })).toBeNull();
    });

    test('removes an existing task and returns false for missing ones', () => {
      const task = taskService.create({ title: 'Disposable' });

      expect(taskService.remove(task.id)).toBe(true);
      expect(taskService.findById(task.id)).toBeUndefined();
      expect(taskService.remove(task.id)).toBe(false);
    });
  });

  describe('completion and stats', () => {
    test('marks a task complete and preserves existing priority', () => {
      const task = taskService.create({ title: 'Ship', priority: 'high' });

      const completed = taskService.completeTask(task.id);

      expect(completed).toEqual(
        expect.objectContaining({
          id: task.id,
          status: 'done',
          priority: 'high',
          completedAt: expect.any(String),
        })
      );
    });

    test('returns null when completing a missing task', () => {
      expect(taskService.completeTask('missing-id')).toBeNull();
    });

    test('returns task statistics including overdue counts', () => {
      const overdueDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      taskService.create({ title: 'Todo overdue', status: 'todo', dueDate: overdueDate });
      taskService.create({ title: 'In progress', status: 'in_progress', dueDate: futureDate });
      taskService.create({ title: 'Done overdue but complete', status: 'done', dueDate: overdueDate });

      expect(taskService.getStats()).toEqual({
        todo: 1,
        in_progress: 1,
        done: 1,
        overdue: 1,
      });
    });
  });

  describe('assignment', () => {
    test('assigns and reassigns a task', () => {
      const task = taskService.create({ title: 'Assign me' });

      const assigned = taskService.assignTask(task.id, 'John Doe');
      const reassigned = taskService.assignTask(task.id, 'Jane Doe');

      expect(assigned).toEqual(expect.objectContaining({ assignee: 'John Doe' }));
      expect(reassigned).toEqual(expect.objectContaining({ assignee: 'Jane Doe' }));
      expect(taskService.findById(task.id)).toEqual(expect.objectContaining({ assignee: 'Jane Doe' }));
    });

    test('returns null when assigning a missing task', () => {
      expect(taskService.assignTask('missing-id', 'John Doe')).toBeNull();
    });
  });
});
