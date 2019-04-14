import { useContext, useCallback } from 'react';
import { useSubscription } from '@app/hooks/useSubscription';
import ClientStateContext from './ClientStateContext';
import { ClientState, Callback, Mutations } from './types';
import initialState from './initialState';

// Usage:
// const darkMode = useClientState(state =>
//   state.viewer ? state.viewer.darkMode : false,
// );
// const clientState = useClientState()
// clientState.loadViewer()
// clientState.setViewerDarkMode(true)

interface UseClientState {
  <SelectedState>(
    selector: (state: ClientState) => SelectedState,
  ): SelectedState;
  (): Mutations;
}

const useClientState: UseClientState = (
  selector?: (state: ClientState) => any,
) => {
  // db == null on server or initial client side render.
  const db = useContext(ClientStateContext);

  const getCurrentValue = useCallback(
    () => (selector ? selector(db ? db.getState() : initialState) : null),
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
