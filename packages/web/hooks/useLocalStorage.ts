import throttle from 'lodash.throttle';
import React, { Dispatch, SetStateAction, useContext } from 'react';
import WasRenderedContext from '../contexts/WasRenderedContext';

type Key = 'darkMode' | 'tasks' | 'email' | 'version';

type DarkMode = boolean;

interface TaskText {
  leaves: Array<{ text: string }>;
  object: 'text';
}

export const taskType = 'task';

export interface TaskData {
  completed: boolean;
  depth: number;
}

interface Task {
  data: TaskData;
  nodes: TaskText[];
  object: 'block';
  type: typeof taskType;
}

interface Tasks {
  document: {
    nodes: Task[];
  };
}

type Email = string;

type Version = number;

type Value<K extends Key> = K extends 'darkMode'
  ? DarkMode
  : K extends 'tasks'
  ? Tasks
  : K extends 'email'
  ? Email
  : K extends 'version'
  ? Version
  : never;

// Force storage reset via key.
const storageVersion = 1;
const storageKey = (key: string) => `actualtasks-${storageVersion}-${key}`;

const setValues: {
  [key in Key]: Array<Dispatch<SetStateAction<Value<Key>>>>
} = {
  darkMode: [],
  email: [],
  tasks: [],
  version: [],
};

// Initial values must be here because useLocalStorage owns them.
const initialValues: { [key in Key]: Value<Key> } = {
  darkMode: false,
  email: '',
  tasks: {
    document: {
      nodes: [
        {
          data: {
            completed: false,
            depth: 0,
          },
          nodes: [
            {
              leaves: [
                {
                  // Because autoFocus does not work.
                  text: 'Click me.',
                },
              ],
              object: 'text',
            },
          ],
          object: 'block',
          type: 'task',
        },
        {
          data: {
            completed: false,
            depth: 1,
          },
          nodes: [
            {
              leaves: [
                {
                  // Because autoFocus does not work.
                  text: 'Then this.',
                },
              ],
              object: 'text',
            },
          ],
          object: 'block',
          type: 'task',
        },
      ],
    },
  },
  version: 1,
};

const setStorageItem = (key: Key, value: any) => {
  // TODO: Handle errors via Sentry.
  // try {
  localStorage.setItem(storageKey(key), JSON.stringify(value));
  // } catch (error) {
  //   // tslint:disable-next-line:no-console
  //   console.log(error);
  // }
};

const setStorageItemThrottled = throttle(setStorageItem, 500);

const useLocalStorage = <K extends Key>(
  key: K,
  ignoreSetValue: boolean = false,
): [Value<K>, (value: Value<K>) => void] => {
  const getItem = <T extends Key>(key: T): Value<T> | null => {
    try {
      const item = localStorage.getItem(storageKey(key));
      if (item == null) return null;
      return JSON.parse(item);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
    }
    return null;
  };

  const wasRendered = useContext(WasRenderedContext);

  // Initial value is the must for the React hydrate but only for it.
  // @ts-ignore This must be somehow resovable without ifs, I hope.
  const [value, setValue] = React.useState<Value<K>>(() => {
    return wasRendered
      ? getItem(key) || initialValues[key]
      : initialValues[key];
  });

  const maybeLoadValueFromStorage = () => {
    const storageValue = getItem(key);
    if (storageValue != null) setValue(storageValue);
  };

  const maybeMigrateLocalStorageData = () => {
    // Migrate only one tab, other tabs will get it via storage event.
    const migrationDoneSessionKey = storageKey('migrationDone');
    const migrationDone = sessionStorage.getItem(migrationDoneSessionKey);
    if (migrationDone === 'true') return;
    const done = () => {
      sessionStorage.setItem(migrationDoneSessionKey, 'true');
    };
    // // Example:
    // switch (getItem('version') || 1) {
    //   case 1: {
    //     // const tasks: Tasks | null = getItem('tasks');
    //     // if (tasks == null) return;
    //     // tasks.document.nodes = tasks.document.nodes.map(node => ({
    //     //   ...node,
    //     //   // change something
    //     // }));
    //     // setStorageItem('version', 2);
    //     // setStorageItem('tasks', tasks);
    //     break;
    //   }
    // }
    done();
  };

  React.useEffect(() => {
    maybeMigrateLocalStorageData();
    // To override initial render data.
    if (!wasRendered) maybeLoadValueFromStorage();
    setValues[key].push(setValue);
    return () => {
      setValues[key].splice(setValues[key].indexOf(setValue), 1);
    };
  }, []);

  const syncLocalStorage = (event: StorageEvent) => {
    if (event.key === storageKey(key)) {
      maybeLoadValueFromStorage();
    }
  };

  React.useEffect(() => {
    window.addEventListener('storage', syncLocalStorage);
    return () => {
      window.removeEventListener('storage', syncLocalStorage);
    };
  }, []);

  const set = (value: Value<K>) => {
    setStorageItemThrottled(key, value);
    setValues[key].forEach(setValueFn => {
      if (ignoreSetValue && setValueFn === setValue) return;
      setValueFn(value);
    });
  };
  return [value, set];
};

export default useLocalStorage;
