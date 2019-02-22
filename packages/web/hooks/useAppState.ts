import { AppState } from '@app/shared/appStateConfig';
import { useAppState as useAppStateLib } from '@app/shared/lib/appstate';
import { SetAppState } from '@app/shared/lib/appState/AppStateContext';

// Make typed useAppState version, so we don't have to:
//  - import AppState type everywhere
//  - define SelectedState, because it's inferred.
const useAppState = <SelectedState>(
  selector: (state: AppState) => SelectedState,
): [SelectedState, SetAppState<AppState>] => {
  return useAppStateLib<AppState, SelectedState>(selector);
};

export default useAppState;
