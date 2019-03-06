// Remember:
//  - Make everything strict. It simplifies migrations and DX.
//  - Never change any type. Always add a new version with a migration.
// That's all.
// We don't need nullable and versionless API like with GraphQL, because data
// are local and client is shipped with migrations.

// "Immutable" types. Never ever change them.

interface User1 {
  email: string;
  darkMode: boolean;
}

interface TaskList1 {
  id: string;
  createdAt: number;
  // creatorEmail: string; // Will be set when shared.
  // Max length 32. TODO: Enforce it in AppStateProvider setAppState.
  name: string;
  slate: {
    document: {
      nodes: {
        data: {
          completed: boolean;
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
  };
}

// Use these types only in the app state config.

export interface AppState1 {
  viewer: User1;
  taskLists: TaskList1[];
  archivedTaskLists: TaskList1[];
}

// interface AppState2 {
//   viewer: User;
//   fok: string;
// }

// Use these types only in the app.

export type AppState = AppState1;
export type TaskList = TaskList1;
