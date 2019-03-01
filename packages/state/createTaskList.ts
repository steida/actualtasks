import { DeepReadonly } from 'utility-types';
import { TaskList } from './types';
import createClientId from './lib/appstate/createClientId';

const createTaskList = (): DeepReadonly<TaskList> => {
  return {
    id: createClientId(),
    createdAt: Date.now(),
    name: 'Actual',
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

export const createRootTaskList = (): DeepReadonly<TaskList> => {
  const taskList = createTaskList();
  return { ...taskList, id: rootTaskListId, createdAt: 0 };
};

export default createTaskList;
