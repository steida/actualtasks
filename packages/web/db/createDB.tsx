import { openDB, DBSchema } from 'idb';
import {
  User,
  CreateDB,
  Queries,
  Mutations,
  Callback,
} from '@app/clientstate/types';
import produce from 'immer';
import initialQueries from '@app/clientstate/initialQueries';

// We use IndexedDB to have absolute control over native API.
// I considered: LokiJS, PouchDB, LocalStorage, WatermelonDB and some others.
// I suppose it's safer to write two DB implementations (IndexedDB for the web,
// and SQLite for the mobile) than relying on other abstractions for now.
// Being close to the metal FTW.

interface ActualTasksDBSchema extends DBSchema {
  viewers: {
    value: User;
    key: string;
    indexes: { 'by-email': string };
  };
}

export const createDB: CreateDB = async () => {
  const db = await openDB<ActualTasksDBSchema>('actualtasks', 1, {
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
  });

  let queries = initialQueries;

  const callbacks: Callback[] = [];

  const updateQueries = (callback: (queries: Queries) => void) => {
    queries = produce(queries, callback);
    // Maybe we don't have to clone callbacks because setState is async, but...
    [...callbacks].forEach(callback => callback());
  };

  const mutations: Mutations = {
    loadViewer: async () => {
      const viewers = await db.getAll('viewers', undefined, 1);
      if (viewers.length === 1) {
        const viewer = viewers[0];
        updateQueries(queries => {
          queries.viewer = viewer;
        });
      }
      return queries.viewer;
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
    getQueries: () => queries,
    mutations,
  };
};
