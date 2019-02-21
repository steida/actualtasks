interface User {
  email: string;
  darkMode: boolean;
}

export interface AppState1 {
  users: User[];
  viewer: User;
}

export interface AppState2 {
  users: User[];
  viewer: User;
  fok: string;
}

export type AppState = AppState2;
