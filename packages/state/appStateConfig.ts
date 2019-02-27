import { DeepReadonly } from 'utility-types';
import createTaskList from './createTaskList';

const name = 'actualtasks';

// Remember: Never ever change any interface without version migration step.
// Treat types are immutable structures. Never change type. Add new instead.

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

export interface TaskList1 {
  id: string;
  createdAt: number;
  name: string;
  slate: {
    document: {
      nodes: {
        data: {
          completed: boolean;
          depth: number;
        };
        nodes: {
          leaves: { text: string }[];
          object: 'text';
        }[];
        object: 'block';
        type: 'task';
      }[];
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

// This is the index undeletable taskList for index URL.
const indexTaskListId = 'actual';
const indexTaskList: DeepReadonly<TaskList1> = {
  ...createTaskList(),
  id: indexTaskListId,
  createdAt: 0,
};

const migrations = [
  (): AppState1 => {
    return {
      taskLists: [indexTaskList],
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
