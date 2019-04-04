// Because data are persisted in local storage, we need rock solid migrations.
// Versioned types help a lot.
// Rules:
//  - Prefer strict types. Optional strict types are fine too.
//  - Add next app version with migration for any structural schema changed.
// That's all.

// Versioned types. Not exported, because they are used only here in this file.
// Change these types very carefully. Basically, only nullable types are safe.

interface User1 {
  email: string;
  darkMode: boolean;
}

interface Slate1 {
  document: {
    nodes: {
      data: {
        completed: boolean;
        completedAt?: number;
        depth: number;
      };
      nodes: {
        leaves: { text: string; object: 'leaf' }[];
        object: 'text';
      }[];
      object: 'block';
      type: 'task';
    }[];
  };
}

interface TaskList1 {
  id: string;
  createdAt: number;
  // Nullable strict type. Can be added and removed safely.
  archivedAt?: number;
  // creatorEmail: string; // Will be set when shared.
  // Max length 32. TODO: Enforce it in AppStateProvider setAppState.
  name: string;
  slate: Slate1;
  // Ideally, archived should be a flag. But because of Slate immutable.js, we
  // have to maintain clonned state, and filtering and serialization sucks.
  // Let's wait for Slate with Immer instead of immutable.js.
  archivedSlate?: Slate1;
}

// Versioned app states. Use them only in the app state config.
// Never ever change these types.

export interface AppState1 {
  viewer: User1;
  taskLists: TaskList1[];
  archivedTaskLists: TaskList1[];
}

// export type AppState2 = {
//   viewer: User1;
//   taskLists: TaskList2[];
//   archivedTaskLists: TaskList2[];
// }

// Current types to be used in the current app code and nowhere else.

// TODO: Use DeepReadonly/ReadonlyArray once I figure out why it breaks types.
// import { DeepReadonly } from 'utility-types';

export type User = User1;
export type AppState = AppState1;
export type TaskList = TaskList1;
