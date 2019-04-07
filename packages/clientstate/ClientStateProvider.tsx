import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { ClientDB } from './types';
import ClientStateContext from './ClientStateContext';

interface ClientStateProviderProps {
  children: ReactNode;
  splashScreen: ReactNode;
  dbPromise: Promise<ClientDB> | null;
}

const ClientStateProvider: FunctionComponent<
  ClientStateProviderProps
> = props => {
  const [db, setDB] = useState<ClientDB | null>(null);

  useEffect(() => {
    if (props.dbPromise == null) return;
    const resolveDBPromise = async () => {
      setDB(await props.dbPromise);
    };
    resolveDBPromise();
  }, [props.dbPromise]);

  // TODO: Rewrite.
  // Note how we reset the whole tree on loaded via key.
  // That's because new app state have to force update all local initial states.
  // https://twitter.com/estejs/status/1102238792382062593
  // <AppStateContext.Provider key={loaded.toString()}
  return (
    <ClientStateContext.Provider value={db}>
      {/* Always render children so Google bot can index blog etc. */}
      {props.children}
      {/* But hidden until DB is ready. */}
      {db == null && props.splashScreen}
    </ClientStateContext.Provider>
  );
};

export default ClientStateProvider;
