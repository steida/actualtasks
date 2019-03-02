import produce from 'immer';
import throttle from 'lodash.throttle';
import React, { useState, useRef, FunctionComponent } from 'react';
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
  const { current: callbacks } = useRef(new Set<Callback>());
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

  const saveThrottled = React.useMemo(() => throttle(save, 500), [save]);

  const setAppStateRef = (state: object) => {
    appStateRef.current = state;
    // Note Set forEach has a different behavior than Array forEach.
    // "Each value is visited once, except in the case when it was deleted and
    // re-added before forEach() has finished. callback is not invoked for
    // values deleted before being visited. New values added before forEach()
    // has finished will be visited."
    // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach
    // If callbacks were an array, dispatch could and would break forEach.
    // forEach on the cloned array did not help entirely.
    // Anyway, React team will provide publish more guidance on subscribing to
    // third party data sources soon.
    // https://github.com/facebook/react/issues/14988#issuecomment-468616077
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
      setLoaded(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
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
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
      };
    },
    setAppState(callback) {
      const nextState = produce(getAppState(), callback);
      // TODO: Schema validation.
      setAppStateRef(nextState);
    },
  });

  return (
    <AppStateContext.Provider value={context.current}>
      {props.children}
      {loaded === false && props.splashScreen}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
