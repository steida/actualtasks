import { DeepReadonly } from 'utility-types';

import { ClientState } from './types';

// The idea of reactive IndexedDB is simple.
// We have one common client state for UI which is loaded lazily.
// For example, index page, then me page, etc. everything loaded only once.
// Once a state is loaded, only mutations can change it.

// Initial state is just an empty structure. Except viewer.
export const initialState: DeepReadonly<ClientState> = {
  viewer: {
    email: '',
    darkMode: false,
  },
  taskLists: {},
};
