import { SetAppState as SetAppState_ } from './AppStateContext';
import AppStateProvider from './AppStateProvider';
import useAppState from './useAppState';

export type SetAppState = SetAppState_;

// hmm, s tim je neco spatne, bude uz fungovat?
// Do not reexport SetAppState type. Webpack reports false warning.

export { AppStateProvider, useAppState };
