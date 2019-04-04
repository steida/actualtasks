import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { ClientDB } from './types';

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

  const test = async () => {
    if (db) {
      await db.loadViewer();
      // eslint-disable-next-line no-console
      // console.log(db.getViews().viewer);
    }
  };
  test();

  return (
    <>
      {/* Always render children so Google bot can index blog etc. */}
      {props.children}
      {/* But hide it until DB is ready. */}
      {db == null && props.splashScreen}
    </>
  );
};

export default ClientStateProvider;
