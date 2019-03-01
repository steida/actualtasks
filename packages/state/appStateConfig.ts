import { createRootTaskList } from './createTaskList';
import { AppState1 } from './types';

const name = 'actualtasks';

const migrations = [
  (): AppState1 => {
    return {
      taskLists: [createRootTaskList()],
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
