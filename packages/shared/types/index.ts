interface User {
  readonly email: string;
  readonly darkMode: boolean;
}

export interface AppState1 {
  readonly users: User[];
  readonly viewer: User;
}

export interface AppState2 {
  readonly users: User[];
  readonly viewer: User;
  readonly fok: string;
}

export type AppState = AppState2;
