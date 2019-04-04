import { openDB, DBSchema } from 'idb';
import { User, CreateDB, Views } from '@app/clientstate/types';
import produce from 'immer';

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

// nemelo by bejt soucasti clientstate? imho jo
export interface DB {
  loadViewer: () => Promise<User | null>;
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

  // const subscribe
  // produce

  let views: Views = {
    viewer: null,
    taskLists: {},
  };

  const update = (callback: (views: Views) => void) => {
    views = produce(views, callback);
  };

  return {
    // subscribe() {

    // }
    getViews: () => views,
    async loadViewer() {
      // Load once because it's cached.
      // TODO: Loader factory.
      if (views.viewer != null) return views.viewer;
      const viewers = await db.getAll('viewers', undefined, 1);
      const viewer = viewers.length === 1 ? viewers[0] : null;
      update(views => {
        views.viewer = viewer;
      });
      return views.viewer;
    },
    // async loadTaskList(_id) {
    //   ret
    // },
  };
};
