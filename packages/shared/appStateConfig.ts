const name = 'actualtasks';

interface User {
  readonly email: string;
  readonly darkMode: boolean;
}

// To add new AppState version:
//  - Add new AppStateX, do not save.
//  - Set AppState to AppStateX, do not save.
//  - Fix TypeScript errors, do not save.
//  - Add migration, do not save.
//  - If TypeScript is happy, save! Hot reloading will update local storage but
//    not UI, reload is the must.

interface AppState1 {
  readonly users: User[];
  readonly viewer: User;
}

interface AppState2 {
  readonly users: User[];
  readonly viewer: User;
  readonly fok: string;
}

export type AppState = AppState1;

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
