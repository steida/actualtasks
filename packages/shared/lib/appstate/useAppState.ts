import React from 'react';
import AppStateContext from './AppStateContext';

export type SetAppState<S> = (callback: (state: S) => void) => void;

const useAppState = <SelectedState, AppState>(
  selector: (state: AppState) => SelectedState,
): [SelectedState, SetAppState<AppState>] => {
  const context = React.useContext(AppStateContext);
  const getSelectedState = () => selector(context.getAppState());
  const [state, setState] = React.useState(() => getSelectedState());

  React.useEffect(() => {
    return context.subscribe(() => {
      setState(getSelectedState());
    });
  }, []);

  return [state, context.setAppState];
};

export default useAppState;
