import { TaskList } from './types';
import createClientId from './lib/appstate/createClientId';

const createTaskList = (name: string): TaskList => {
  return {
    id: createClientId(),
    createdAt: Date.now(),
    name,
    slate: {
      document: {
        nodes: [
          {
            data: { completed: false, depth: 0 },
            nodes: [
              {
                leaves: [{ text: 'What should be done?' }],
                object: 'text',
              },
            ],
            object: 'block',
            type: 'task',
          },
        ],
      },
    },
  };
};

// The id of undeletable TaskList for index URL.
export const rootTaskListId = 'actual';

export const createRootTaskList = (): TaskList => {
  const taskList = createTaskList('Actual');
  return { ...taskList, id: rootTaskListId, createdAt: 0 };
};

export default createTaskList;
