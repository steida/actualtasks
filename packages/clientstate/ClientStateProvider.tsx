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

  // Remember initial client render has to match server side rendered HTML.
  useEffect(() => {
    if (props.dbPromise == null) return;
    const resolveDBPromise = async () => {
      setDB(await props.dbPromise);
    };
    resolveDBPromise();
  }, [props.dbPromise]);

  return (
    <ClientStateContext.Provider value={db}>
      {props.children}
    </ClientStateContext.Provider>
  );
};

export default ClientStateProvider;
