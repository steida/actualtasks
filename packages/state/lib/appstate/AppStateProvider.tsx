import produce from 'immer';
import throttle from 'lodash.throttle';
import React, {
  useState,
  useRef,
  FunctionComponent,
  useMemo,
  useEffect,
} from 'react';
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
  children: React.ReactNode;
  splashScreen?: React.ReactNode;
}

const AppStateProvider: FunctionComponent<AppStateProviderProps> = props => {
  const { name, migrations } = props.config;
  const { current: callbacks } = useRef<Callback[]>([]);
  const [loaded, setLoaded] = useState(false);
  const appStateRef = useRef<object | null>(null);

  // AppState is ref, because state changes are propagated to listeners.
  // Initial value is created by migrations.
  // After the initial render, a value from local storage is loaded, maybe
  // migrated, then set, so registered hooks are maybe updated.
  // Why double rendering? Because we have to match initial state from the
  // server with initial render, then we can use state from local storage.
  // In future, we can fetch end-to-end encrypted state from the server.

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

  // Isn't saveThrottled always recreated? No, AppStateProvider renders 2x only.
  const saveThrottled = useMemo(() => throttle(save, 500), [save]);

  const setAppStateRef = (state: object, noCallbacks?: boolean) => {
    appStateRef.current = state;
    // Load don't have run callbacks because app will be rerendered on loaded.
    // Load don't have to save state because it will be saved on change anyway.
    if (noCallbacks === true) return;
    // Maybe we don't have to clone callbacks because setState is async, but...
    [...callbacks].forEach(callback => callback());
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
      setAppStateRef(state, true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!loaded) load();
  }, [load, loaded]);

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

  useEffect(() => {
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
  const context = useRef<AppStateContextType>({
    getAppState,
    subscribe(callback) {
      callbacks.push(callback);
      return () => {
        callbacks.splice(callbacks.indexOf(callback), 1);
      };
    },
    setAppState(callback) {
      const nextState = produce(getAppState(), callback);
      // TODO: Schema validation.
      setAppStateRef(nextState);
    },
  });

  // Note how we reset the whole tree on loaded via key.
  // That's because new app state have to force update all local initial states.
  // https://twitter.com/estejs/status/1102238792382062593
  return (
    <AppStateContext.Provider key={loaded.toString()} value={context.current}>
      {props.children}
      {loaded === false && props.splashScreen}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
