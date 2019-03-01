import produce from 'immer';
import throttle from 'lodash.throttle';
import React from 'react';
import { AsyncStorage } from 'react-native';
import AppStateContext, {
  AppStateContextType,
  Callback,
} from './AppStateContext';

type Migrations = ((() => object) | ((state: any) => object))[];

interface StorageData {
  version: number;
  state: object;
}

interface Config {
  name: string;
  migrations: Migrations;
}

interface AppStateProviderProps {
  config: Config;
  children: React.ReactChild;
}

const AppStateProvider: React.FunctionComponent<
  AppStateProviderProps
> = props => {
  const { name, migrations } = props.config;
  const { current: callbacks } = React.useRef<Callback[]>([]);
  const loadedRef = React.useRef(false);
  const appStateRef = React.useRef<object | null>(null);

  // https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
  const getAppState = () => {
    const state = appStateRef.current;
    if (state != null) return state;
    return (appStateRef.current = migrations.reduce(
      (state, migration) => migration(state),
      {},
    ));
  };

  const save = async () => {
    const state = getAppState();
    const version = migrations.length;
    // Atomic object is easy and solid. For bigger datasets, we can use another
    // universal (React + React Native) storage like WatermelonDB.
    const data: StorageData = { version, state };
    try {
      // We can optimize AsyncStorage. For example, we can split object by keys.
      await AsyncStorage.setItem(name, JSON.stringify(data));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  const saveThrottled = React.useMemo(() => throttle(save, 500), [save]);

  const setAppStateRef = (state: object) => {
    appStateRef.current = state;
    callbacks.forEach(callback => callback());
    saveThrottled();
  };

  const load = async () => {
    try {
      const value = await AsyncStorage.getItem(name);
      if (value == null) return;
      const data: StorageData = JSON.parse(value);
      const state = migrations
        .slice(data.version)
        .reduce((state, migration) => migration(state), data.state);
      setAppStateRef(state);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      loadedRef.current = true;
    }
  };

  React.useEffect(() => {
    load();
  }, [load]);

  const syncStorage = async (event: StorageEvent) => {
    if (event.key !== name) return;
    try {
      const value = await AsyncStorage.getItem(name);
      if (value == null) return;
      const data: StorageData = JSON.parse(value);
      setAppStateRef(data.state);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  React.useEffect(() => {
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) return;
    // eslint-disable-next-line no-undef
    window.addEventListener('storage', syncStorage);
    // eslint-disable-next-line consistent-return
    return () => {
      // eslint-disable-next-line no-undef
      window.removeEventListener('storage', syncStorage);
    };
  }, [syncStorage]);

  // Always the same value, so Context consumers will not be updated on
  // appState change. We use subscribed callbacks instead.
  const context = React.useRef<AppStateContextType>({
    getAppState,
    subscribe(callback) {
      callbacks.push(callback);
      return () => {
        callbacks.splice(callbacks.indexOf(callback), 1);
      };
    },
    setAppState(callback) {
      if (!loadedRef.current)
        throw Error(
          'useAppState: setAppState can not be called before state is loaded.',
        );
      const nextState = produce(getAppState(), callback);
      // TODO: Schema validation.
      setAppStateRef(nextState);
    },
  });

  return (
    <AppStateContext.Provider value={context.current}>
      {props.children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
