// Because data are persisted in local storage, we need rock solid migrations.
// Versioned types help a lot.
// Rules:
//  - Prefer strict types. Optional strict types are fine too.
//  - Add next app version with migration for any structural schema changed.
// That's all.

// Versioned types. Not exported, because they are used only here in this file.
// Change these types very carefully. Basically, only nullable types are safe.

// I tried DeepReadonly from utility-types but it breaks types. Readonly works.

type User1 = Readonly<{
  email: string;
  darkMode: boolean;
}>;

type Slate1 = Readonly<{
  document: Readonly<{
    nodes: Readonly<{
      data: Readonly<{
        completed: boolean;
        completedAt?: number;
        depth: number;
      }>;
      nodes: Readonly<{
        leaves: Readonly<{ text: string; object: 'leaf' }>[];
        object: 'text';
      }>[];
      object: 'block';
      type: 'task';
    }>[];
  }>;
}>;

type TaskList1 = Readonly<{
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
}>;

// Versioned app states. Use them only in the app state config.
// Never ever change these types.

export type AppState1 = Readonly<{
  viewer: User1;
  taskLists: TaskList1[];
  archivedTaskLists: TaskList1[];
}>;

// export type AppState2 = Readonly<{
//   viewer: User1;
//   taskLists: TaskList2[];
//   archivedTaskLists: TaskList2[];
// }>

// Current types to be used in the current app code and nowhere else.

export type AppState = AppState1;
export type TaskList = TaskList1;
