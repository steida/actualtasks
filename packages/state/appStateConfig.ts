import { AppState1 } from './types';

// Remember, never ever change anything here without a migration step.
// Migrations must be immutable. Do not use helpers which can change.

const name = 'actualtasks';
export const rootTaskListId = 'actual';
export const rootTaskListCreateAt = 0;

const migrations = [
  (): AppState1 => {
    return {
      taskLists: [
        {
          id: rootTaskListId,
          createdAt: rootTaskListCreateAt,
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
        },
      ],
      viewer: {
        darkMode: false,
        email: '',
      },
    };
  },
  // (state: AppState1): AppState2 => {
  //   return { ...state, fok: '123' };
  // },
];

export default { name, migrations };
