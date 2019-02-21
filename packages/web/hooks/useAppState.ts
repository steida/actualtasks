// So we don't have to import AppState everywhere.
import {
  SetAppState,
  useAppState as useAppStateLib,
} from '@app/shared/lib/appstate';
import { AppState } from '@app/shared/types';

const useAppState = <SelectedState>(
  selector: (state: AppState) => SelectedState,
): [SelectedState, SetAppState<AppState>] => {
  return useAppStateLib(selector);
};

export default useAppState;
