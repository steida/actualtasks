import React, { Dispatch, SetStateAction } from 'react';

type Key = 'darkMode' | 'tasks';

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

type Value<K extends Key> = K extends 'darkMode'
  ? DarkMode
  : K extends 'tasks'
  ? Tasks
  : never;

const storageKey = (key: string) => `actualtasks-${key}`;

const setValues: {
  [key in Key]: Array<Dispatch<SetStateAction<Value<Key>>>>
} = {
  darkMode: [],
  tasks: [],
};

const initialValues: { [key in Key]: Value<Key> } = {
  darkMode: false,
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

const useLocalStorage = <K extends Key>(
  key: K,
  ignoreSetValue: boolean = false,
): [Value<K>, (value: Value<K>) => void] => {
  // Initial value is the must for the server side rendering.
  // @ts-ignore TODO: Something is wrong here. Fix it.
  const [value, setValue] = React.useState<Value<K>>(() => initialValues[key]);

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
    // throttle?
    localStorage.setItem(storageKey(key), JSON.stringify(value));
    setValues[key].forEach(setValueFn => {
      if (ignoreSetValue && setValueFn === setValue) return;
      setValueFn(value);
    });
  };
  return [value, set];
};

export default useLocalStorage;
