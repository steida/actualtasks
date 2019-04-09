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
  dbPromise: Promise<ClientDB> | null;
}

const ClientStateProvider: FunctionComponent<
  ClientStateProviderProps
> = props => {
  const [db, setDB] = useState<ClientDB | null>(null);

  // Remember, the initial client render has to match the server side render.
  // That's why we setDB in useEffect which is not called on the server.
  useEffect(() => {
    if (props.dbPromise == null) return;

    let didUnsubscribe = false;

    const resolveDBPromise = async () => {
      const resolvedDB = await props.dbPromise;
      if (!didUnsubscribe) setDB(resolvedDB);
    };
    resolveDBPromise();

    return () => {
      didUnsubscribe = true;
    };
  }, [props.dbPromise]);

  return (
    <ClientStateContext.Provider value={db}>
      {props.children}
    </ClientStateContext.Provider>
  );
};

export default ClientStateProvider;
