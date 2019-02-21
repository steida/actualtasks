import React from 'react';
import AppStateContext, {
  AppStateContextType,
  Callback,
  Unsubscribe,
} from './AppStateContext';

// TODO: Use mweststrate/immer for app state. We will get changesets for free!

type Migrations = Array<(state: object) => object>;

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
  const [appState] = React.useState(() => {
    return props.config.migrations.reduce(
      (state, migration) => migration(state),
      {},
    );
  });
  const callbacks = React.useRef<Callback[]>([]);

  // Always the same value, so Context consumers should not be updated on change.
  const context = React.useRef<AppStateContextType>({
    getAppState() {
      return appState;
    },
    subscribe(callback: Callback): Unsubscribe {
      callbacks.current.push(callback);
      return () => {
        callbacks.current.splice(callbacks.current.indexOf(callback), 1);
      };
    },
    setAppState() {
      // Tady pouzit immer, ok.
      //
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
