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
//  - If TypeScript is happy, save! (Hot reloading will update local storage.)

interface AppState1 {
  readonly users: User[];
  readonly viewer: User;
}

// interface AppState2 {
//   readonly users: User[];
//   readonly viewer: User;
//   readonly fok: string;
// }

export type AppState = AppState1;

// ten musi bejt jeden, takze is viewer?
// aha! joiny! hmm, hmm, jako, jo, chci to denormalizovat
// potrebuju nejakej koncept joiny, viewer bude mit email
// je email nutne? proc ne uniqueid?
// pac sync, email je cajk, je to lokalni, okokok
// viewer bude email, a musim join, to je spravne
// co ty chyby? aha, asi ho treloading, ok
const anonymousUser = { email: '', darkMode: false };

const migrations = [
  (): AppState1 => {
    return {
      users: [anonymousUser],
      viewer: anonymousUser,
    };
  },
  // (state: AppState1): AppState2 => {
  //   return { ...state, fok: '123' };
  // },
];

export default { name, migrations };
