import { DeepReadonly } from 'utility-types';

// TODO: Describe migrations.
// Nullable strict type. Can be added and removed safely. Etc.

export interface User {
  email: string;
  darkMode: boolean;
}

export interface TaskList {
  id: string;
  createdAt: number;
  archivedAt?: number;
  name: string;
}

export interface ClientState {
  viewer: User;
  taskLists: { [id: string]: TaskList | null };
}

export interface Mutations {
  dangerouslyDeleteDB(): void;
  loadViewer(): Promise<User>;
  setViewerDarkMode(darkMode: boolean): Promise<void>;
  setViewerEmail(email: string): Promise<void>;
  // loadTaskList(id: string): Promise<TaskList | null>;
}

export type Callback = () => void;

export interface ClientDB {
  subscribe: (callback: Callback) => () => void;
  getState: () => DeepReadonly<ClientState>;
  mutations: Mutations;
}

export type CreateDB = () => Promise<ClientDB>;
