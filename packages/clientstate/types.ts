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

export interface Views {
  viewer: User | null;
  taskLists: { [id: string]: TaskList | null };
}

export interface ClientDB {
  getViews: () => DeepReadonly<Views>;
  loadViewer: () => Promise<User | null>;
  // loadTaskList: (id: string) => Promise<TaskList | null>;
}

export type CreateDB = () => Promise<ClientDB>;
