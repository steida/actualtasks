// Remember:
//  1) Make everything strict. It will simplify migrations and DX.
//  2) Never ever change any interface nor type. Always add a new version.
//  3) Then add a migration step.
// That's all. Now state migration is unbreakable.
// FAQ: Why it's not versionless like GraphQL?
// Because locally, without a brittle network, we have a control.
// GraphQL must deal with client suddently getting a new version of data.

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
  taskLists: TaskList1[];
}

// interface AppState2 {
//   viewer: User;
//   fok: string;
// }

export type AppState = AppState1;
export type TaskList = TaskList1;
