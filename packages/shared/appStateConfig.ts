const name = 'actualtasks';

// Note we don't use arrays for models.
// https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
// Also, we normalize data. Joins are super cheap on in memory objects.
// To add new AppState version:
//  - Add new AppStateX, do not save.
//  - Set AppState to AppStateX, do not save.
//  - Fix TypeScript errors, do not save.
//  - Add migration, do not save.
//  - If TypeScript is happy, save! Hot reloading will update local storage but
//    not UI, reload is the must.

interface User {
  readonly email: string;
  readonly darkMode: boolean;
}

interface AppState1 {
  readonly viewer: User;
}

// interface AppState2 {
//   readonly viewer: User;
//   readonly fok: string;
// }

export type AppState = AppState1;

const migrations = [
  (): AppState1 => {
    return {
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
