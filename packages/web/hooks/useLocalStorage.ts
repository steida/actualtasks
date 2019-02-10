import throttle from 'lodash.throttle';
import React, { Dispatch, SetStateAction, useContext } from 'react';
import WasRenderedContext from '../contexts/WasRenderedContext';

type Key = 'darkMode' | 'tasks' | 'email';

type DarkMode = boolean;

interface TaskText {
  leaves: Array<{ text: string }>;
  object: 'text';
}

export const taskItemType = 'task-item';

interface TaskItem {
  data: {
    completed: boolean;
  };
  nodes: TaskText[];
  object: 'block';
  type: typeof taskItemType;
}

interface Tasks {
  document: {
    nodes: TaskItem[];
  };
}

type Email = string;

type Value<K extends Key> = K extends 'darkMode'
  ? DarkMode
  : K extends 'tasks'
  ? Tasks
  : K extends 'email'
  ? Email
  : never;

const storageKey = (key: string) => `actualtasks-${key}`;

const setValues: {
  [key in Key]: Array<Dispatch<SetStateAction<Value<Key>>>>
} = {
  darkMode: [],
  email: [],
  tasks: [],
};

// Initial values must be here because useLocalStorage owns them.
const initialValues: { [key in Key]: Value<Key> } = {
  darkMode: false,
  email: '',
  tasks: {
    document: {
      nodes: [
        {
          data: { completed: false },
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
          type: 'task-item',
        },
      ],
    },
  },
};

const setStorageItem = throttle((key: string, value: any) => {
  localStorage.setItem(storageKey(key), JSON.stringify(value));
}, 500);

const useLocalStorage = <K extends Key>(
  key: K,
  ignoreSetValue: boolean = false,
): [Value<K>, (value: Value<K>) => void] => {
  const getStorageValue = (): Value<K> | null => {
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
      ? getStorageValue() || initialValues[key]
      : initialValues[key];
  });

  const maybeSetStorageValue = () => {
    const storageValue = getStorageValue();
    if (storageValue != null) setValue(storageValue);
  };

  React.useEffect(() => {
    maybeSetStorageValue();
    setValues[key].push(setValue);
    return () => {
      setValues[key].splice(setValues[key].indexOf(setValue), 1);
    };
  }, []);

  const syncLocalStorage = (event: StorageEvent) => {
    if (event.key === storageKey(key)) {
      maybeSetStorageValue();
    }
  };

  React.useEffect(() => {
    window.addEventListener('storage', syncLocalStorage);
    return () => {
      window.removeEventListener('storage', syncLocalStorage);
    };
  }, []);

  const set = (value: Value<K>) => {
    setStorageItem(key, value);
    setValues[key].forEach(setValueFn => {
      if (ignoreSetValue && setValueFn === setValue) return;
      setValueFn(value);
    });
  };
  return [value, set];
};

export default useLocalStorage;
