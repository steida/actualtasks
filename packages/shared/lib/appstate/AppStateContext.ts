import { Draft } from 'immer';
import React from 'react';

export type SetAppState<S = any> = (
  callback: (draft: Draft<S>) => void,
) => void;
export type Callback = () => void;
export type Unsubscribe = () => void;

export interface AppStateContextType {
  getAppState: () => any;
  subscribe: (callback: Callback) => Unsubscribe;
  setAppState: SetAppState;
}

export default React.createContext<AppStateContextType>({
  getAppState() {
    throw Error('useAppState: Please provide AppStateProvider.');
  },
  subscribe() {
    throw Error('useAppState: Please provide AppStateProvider.');
  },
  setAppState() {
    throw Error('useAppState: Please provide AppStateProvider.');
  },
});
