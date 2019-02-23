import { DeepReadonly } from 'utility-types';

const name = 'actualtasks';

// Remember: Never ever change any interface without version migration step.

// To add new AppState version:
//  - Add new AppStateX, do not save.
//  - Set AppState to AppStateX, do not save.
//  - Fix TypeScript errors, do not save.
//  - Add migration, do not save.
//  - If TypeScript is happy, save! Hot reloading will update local storage but
//    not UI, reload is the must.

interface User1 {
  email: string;
  darkMode: boolean;
}

interface TaskList1 {
  id: string;
  name: string;
  slate: {
    document: {
      nodes: Array<{
        data: {
          completed: boolean;
          depth: number;
        };
        nodes: Array<{
          leaves: Array<{ text: string }>;
          object: 'text';
        }>;
        object: 'block';
        type: 'task';
      }>;
    };
  };
}

type AppState1 = DeepReadonly<{
  viewer: User1;
  taskLists: TaskList1[];
}>;

// interface AppState2 {
//   viewer: User;
//   fok: string;
// }

export type AppState = AppState1;

const migrations = [
  (): AppState1 => {
    return {
      taskLists: [
        {
          id: 'actual', // Must be the same both for client and server.
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
