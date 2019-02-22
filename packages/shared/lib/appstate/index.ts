import { SetAppState } from './AppStateContext';
import AppStateProvider from './AppStateProvider';
import useAppState from './useAppState';

// That's how we have to reexport types.
// https://github.com/babel/babel-loader/issues/603#issuecomment-399293448
export type SetAppState<S> = SetAppState<S>;

export { AppStateProvider, useAppState };
