import { DeepReadonly } from 'utility-types';
import { TaskList1 } from './appStateConfig';
import createClientId from './createClientId';

const createTaskList = (id?: string): DeepReadonly<TaskList1> => {
  return {
    id: id == null ? createClientId() : id,
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

export default createTaskList;
