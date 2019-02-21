const name = 'actualtasks';
import { AppState1, AppState2 } from './types';

const anonymousUser = { email: '', darkMode: false };

const migrations = [
  (): AppState1 => {
    return {
      users: [anonymousUser],
      viewer: anonymousUser,
    };
  },
  (state: AppState1): AppState2 => {
    return { ...state, fok: '123' };
  },
];

export default { name, migrations };
