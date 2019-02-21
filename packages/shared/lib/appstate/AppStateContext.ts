import React from 'react';

// I don't know why state must be any when we use interfaces.

export type SetAppState<S = any> = (callback: (state: S) => void) => void;
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
