import { useContext, useCallback } from 'react';
import ClientStateContext from './ClientStateContext';
import { Queries, Callback, Mutations } from './types';
import { useSubscription } from './useSubscription';
import initialQueries from './initialQueries';

// Usage:
// const darkMode = useClientState(queries =>
//   queries.viewer ? queries.viewer.darkMode : false,
// );
// const clientState = useClientState()
// clientState.loadViewer()
// clientState.setViewerDarkMode(true)

interface UseClientState {
  <SelectedState>(selector: (queries: Queries) => SelectedState): SelectedState;
  (): Mutations;
}

const useClientState: UseClientState = (
  selector?: (queries: Queries) => any,
) => {
  // db == null on server or initial client side render.
  const db = useContext(ClientStateContext);

  const getCurrentValue = useCallback(
    () => (selector ? selector(db ? db.getQueries() : initialQueries) : null),
    [db, selector],
  );

  const subscribe = useCallback(
    (callback: Callback) => (db ? db.subscribe(callback) : () => null),
    [db],
  );

  const value = useSubscription({ getCurrentValue, subscribe });

  // No mutations on the server.
  return selector ? value : db ? db.mutations : {};
};

export default useClientState;
