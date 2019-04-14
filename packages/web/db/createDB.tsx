import { openDB, deleteDB, DBSchema } from 'idb';
import {
  User,
  CreateDB,
  ClientState,
  Mutations,
  Callback,
} from '@app/clientstate/types';
import produce from 'immer';
import initialState from '@app/clientstate/initialState';

// We use IndexedDB to have absolute control over native API.
// I considered: LokiJS, PouchDB, LocalStorage, WatermelonDB and some others.
// I suppose it's safer to write two DB implementations (IndexedDB for the web
// and SQLite for the mobile) than relying on other abstractions.
// Being close to the metal FTW. For more informations, check Github issues.

interface ActualTasksDBSchema extends DBSchema {
  viewers: {
    value: User;
    key: string;
    indexes: { 'by-email': string };
  };
}

const name = 'actualtasks';

export const createDB: CreateDB = async () => {
  const db = await openDB<ActualTasksDBSchema>(name, 1, {
    async upgrade(db, oldVersion, _, _tx) {
      // eslint-disable-next-line default-case
      switch (oldVersion) {
        case 0: {
          db.createObjectStore('viewers', {
            keyPath: 'email',
          }).createIndex('by-email', 'email');
          // Populate DB example.
          // await tx.done;
          // await db.put('viewers', {
          //   email: '',
          //   darkMode: false,
          // });
        }
      }
    },
    blocked() {
      // eslint-disable-next-line no-alert
      alert('Please close or reload this windows.');
    },
    blocking() {
      // eslint-disable-next-line no-alert
      alert('Please close or reload this windows.');
    },
  });

  let state = initialState;

  const callbacks: Callback[] = [];

  const updateState = (callback: (state: ClientState) => void) => {
    state = produce(state, callback);
    // Maybe we don't have to clone callbacks because setState is async, but...
    [...callbacks].forEach(callback => callback());
    // It's possible to propagate client state to other browser windows.
    // We can just serialize the whole client state and sync it via StorageEvent.
    // But we don't need it. Even Gmail doesn't do it.
    // And other browser windows will be synced via sync server anyway.
  };

  const mutations: Mutations = {
    dangerouslyDeleteDB() {
      deleteDB(name);
    },
    async loadViewer() {
      const viewers = await db.getAll('viewers', undefined, 1);
      if (viewers.length === 1) {
        const viewer = viewers[0];
        updateState(state => {
          state.viewer = viewer;
        });
      }
      return state.viewer;
    },
    async setViewerDarkMode(darkMode) {
      const viewer = { ...state.viewer, darkMode };
      await db.put('viewers', viewer);
      updateState(state => {
        state.viewer = viewer;
      });
    },
    async setViewerEmail(email) {
      const viewer = { ...state.viewer, email };
      await db.put('viewers', viewer);
      await db.delete('viewers', state.viewer.email);
      updateState(state => {
        state.viewer = viewer;
      });
    },
    // async loadTaskList(_id) {
    //   ret
    // },
  };

  return {
    subscribe(callback) {
      callbacks.push(callback);
      return () => {
        callbacks.splice(callbacks.indexOf(callback), 1);
      };
    },
    getState() {
      return state;
    },
    mutations,
  };
};
