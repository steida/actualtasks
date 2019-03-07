import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import AppStateContext, { SetAppState } from './AppStateContext';

// Example:
// interface AppState { viewer: Viewer }
// const useAppState = createUseAppStateHook<AppState>();
// const viewer = useAppState(state => state.viewer);
// const setAppState = useAppState();

// Tip:
// To optimize useEffect, use useCallback for the selector.

// As for the implementation, check this:
// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
// https://github.com/facebook/react/tree/master/packages/create-subscription#limitations-in-async-mode
// https://gist.github.com/bvaughn/d569177d70b50b58bff69c3c4a5353f3
// Note we don't have to check datasource because local storage is singleton.

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

    const prevSelectedStateRef = useRef<any>(null);
    prevSelectedStateRef.current = getSelectedState();
    // We use prevSelectedStateRef instead of a state.
    // We use setState only for subscribe change detection.
    // https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update
    const [, setState] = useState(prevSelectedStateRef.current);

    const setSelectedState = useCallback(() => {
      const selectedState = getSelectedState();
      // https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update
      if (Object.is(selectedState, prevSelectedStateRef.current)) return;
      prevSelectedStateRef.current = selectedState;
      setState(selectedState);
    }, [getSelectedState]);

    useEffect(() => {
      if (selector == null) return;
      const unsubscribe = context.subscribe(setSelectedState);
      // External values could change between render and mount.
      // In some cases it may be important to handle this case.
      // https://gist.github.com/bvaughn/d569177d70b50b58bff69c3c4a5353f3#file-updating-subscriptions-when-props-change-example-js-L62
      setSelectedState();
      return unsubscribe;
    }, [context, selector, setSelectedState]);

    return selector ? prevSelectedStateRef.current : context.setAppState;
  };

  return useAppState;
};

export default createUseAppStateHook;
