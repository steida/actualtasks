import {
  SetAppState,
  useAppState as useAppStateLib,
} from '@app/shared/lib/appstate';
import { AppState } from '@app/shared/types';

// Make typed useAppState, so we don't have to:
//  - import AppState type everywhere
//  - define Selected state, because it's inferred.
const useAppState = <SelectedState>(
  selector: (state: AppState) => SelectedState,
): [SelectedState, SetAppState<AppState>] => {
  return useAppStateLib(selector);
};

export default useAppState;
