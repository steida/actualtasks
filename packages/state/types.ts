// Remember:
//  1 Make everything strict. It simplifies migrations and DX.
//  2 Never change any interface. Always add a new version with a migration.
//  3 Collections are objects instead of arrays. We don't need "sorted"
//    information and we want fast joins without Array findIndex method.
// That's all.
// We don't need nullable and versionless API like with GraphQL, because data
// are local and client is shipped with migrations.

interface User1 {
  email: string;
  darkMode: boolean;
}

export interface TaskList1 {
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
          leaves: { text: string }[];
          object: 'text';
        }[];
        object: 'block';
        type: 'task';
      }[];
    };
  };
}

export interface AppState1 {
  viewer: User1;
  taskLists: { [key: string]: TaskList1 };
  archivedTaskLists: { [key: string]: TaskList1 };
}

// interface AppState2 {
//   viewer: User;
//   fok: string;
// }

export type AppState = AppState1;
export type TaskList = TaskList1;
