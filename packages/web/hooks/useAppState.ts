import { AppState } from '@app/shared/appStateConfig';
import {
  SetAppState,
  useAppState as useAppStateLib,
} from '@app/shared/lib/appstate';

// Make typed useAppState version, so we don't have to:
//  - import AppState type everywhere
//  - define SelectedState, because it's inferred.
const useAppState = <SelectedState>(
  selector: (state: AppState) => SelectedState,
): [SelectedState, SetAppState<AppState>] => {
  return useAppStateLib<AppState, SelectedState>(selector);
};

export default useAppState;
