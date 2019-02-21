import React from 'react';
import AppStateContext, { SetAppState } from './AppStateContext';

const useAppState = <AppState, SelectedState>(
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
