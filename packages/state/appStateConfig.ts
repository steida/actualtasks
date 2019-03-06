import { AppState1 } from './types';

// Remember:
//  1) Never ever change anything here without a migration step.
//  2) Migrations code must be immutable aka write once. Don't import anything.

const name = 'actualtasks';
export const rootTaskListId = 'actual';

const migrations = [
  (): AppState1 => {
    return {
      taskLists: [
        {
          id: rootTaskListId,
          createdAt: 0,
          name: 'actual',
          slate: {
            document: {
              nodes: [
                {
                  data: { completed: false, depth: 0 },
                  nodes: [
                    {
                      leaves: [
                        { text: 'What should be done?', object: 'leaf' },
                      ],
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
      archivedTaskLists: [],
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
