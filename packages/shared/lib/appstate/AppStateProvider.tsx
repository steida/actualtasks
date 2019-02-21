import produce from 'immer';
import React from 'react';
import AppStateContext, {
  AppStateContextType,
  Callback,
} from './AppStateContext';

// TODO: Use mweststrate/immer for app state. We will get changesets for free!

type Migrations = Array<(() => object) | ((state: any) => object)>;

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
  const appStateRef = React.useRef<object | null>(null);
  const { current: callbacks } = React.useRef<Callback[]>([]);

  const getAppState = () => {
    const state = appStateRef.current;
    if (state != null) return state;
    return (appStateRef.current = props.config.migrations.reduce(
      (state, migration) => migration(state),
      {},
    ));
  };

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
      appStateRef.current = produce(getAppState(), callback);
      callbacks.forEach(callback => callback());
    },
  });

  const [wasRendered, setWasRendered] = React.useState(false);

  React.useEffect(() => {
    // vyvolat migraci globalne jednou, aha, potrebuju ref
    // co migrace pres taby? co se stane?
    // const version = props.migrations.length;
    if (!wasRendered) setWasRendered(true);
  }, []);

  return (
    <AppStateContext.Provider value={context.current}>
      {props.children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
