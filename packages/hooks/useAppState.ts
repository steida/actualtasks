import { AppState } from '@app/state/types';
import { createUseAppStateHook } from '@app/state/lib/appstate';

const useAppState = createUseAppStateHook<AppState>();

export default useAppState;
