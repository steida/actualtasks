import { useContext, useEffect, useState, useCallback } from 'react';
import AppStateContext, { SetAppState } from './AppStateContext';

// Example:
// interface AppState { viewer: Viewer }
// const useAppState = createUseAppStateHook<AppState>();
// const viewer = useAppState(state => state.viewer);
// const setAppState = useAppState();

// Tips:
// To optimize useEffect, use useCallback on selector in caller.
// To bail out of a state update, return null.

interface UseAppState<State> {
  <SelectedState>(selector: (state: State) => SelectedState): SelectedState;
  (): SetAppState<State>;
}

const createUseAppStateHook = <State extends object>(): UseAppState<State> => {
  const useAppState = (selector?: (state: State) => any) => {
    const context = useContext(AppStateContext);

    const getSelectedState = useCallback(() => {
      return selector ? selector(context.getAppState()) : null;
    }, [context, selector]);

    const [state, setState] = useState(() => getSelectedState());

    useEffect(() => {
      if (selector == null) return;
      return context.subscribe(() => {
        // We don't have to memo anything.
        // https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update
        setState(getSelectedState());
      });
    }, [context, getSelectedState, selector]);

    return selector ? state : context.setAppState;
  };

  return useAppState;
};

export default createUseAppStateHook;
