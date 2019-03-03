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
                leaves: [{ text: 'What should be done?', object: 'leaf' }],
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

export default createTaskList;
