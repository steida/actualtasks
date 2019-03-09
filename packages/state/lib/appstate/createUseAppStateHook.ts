import { useContext, useMemo } from 'react';
import AppStateContext, { SetAppState } from './AppStateContext';
import useSubscription from './useSubscription';

// Example:
// interface AppState { viewer: Viewer }
// const useAppState = createUseAppStateHook<AppState>();
// const viewer = useAppState(state => state.viewer);
// const setAppState = useAppState();

// Tip:
// To optimize useEffect, use useCallback for the selector.

// As for the implementation:
// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
// https://github.com/facebook/react/tree/master/packages/create-subscription
// https://gist.github.com/bvaughn/e25397f70e8c65b0ae0d7c90b731b189

interface UseAppState<State> {
  <SelectedState>(selector: (state: State) => SelectedState): SelectedState;
  (): SetAppState<State>;
}

const createUseAppStateHook = <State extends object>(): UseAppState<State> => {
  const useAppState = (selector?: (state: State) => any) => {
    const context = useContext(AppStateContext);
    const value = useSubscription(
      useMemo(
        () => ({
          source: context,
          getCurrentValue: () => {
            return selector ? selector(context.getAppState()) : null;
          },
          subscribe: (_source: any, callback: any) => {
            return context.subscribe(callback);
          },
        }),
        [context, selector],
      ),
    );
    return selector ? value : context.setAppState;
  };
  return useAppState;
};

export default createUseAppStateHook;
