import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import AppStateContext, { SetAppState } from './AppStateContext';

// Example:
// interface AppState { viewer: Viewer }
// const useAppState = createUseAppStateHook<AppState>();
// const viewer = useAppState(state => state.viewer);
// const setAppState = useAppState();

interface UseAppState<State> {
  <SelectedState>(selector: (state: State) => SelectedState): SelectedState;
  (): SetAppState<State>;
}

const createUseAppStateHook = <State extends object>(): UseAppState<State> => {
  const useAppState = (selector?: (state: State) => any) => {
    const context = useContext(AppStateContext);
    const { current: initialSelector } = useRef(selector);

    const getSelectedState = useCallback(() => {
      return initialSelector ? initialSelector(context.getAppState()) : null;
    }, [context, initialSelector]);

    const [state, setState] = useState(() => getSelectedState());

    useEffect(() => {
      if (initialSelector == null) return;
      return context.subscribe(() => {
        // We don't have to memo anything.
        // https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update
        setState(getSelectedState());
      });
    }, [context, getSelectedState, initialSelector]);

    return initialSelector ? state : context.setAppState;
  };

  return useAppState;
};

export default createUseAppStateHook;
