import React from 'react';

export type Callback = () => void;
export type Unsubscribe = () => void;

export interface AppStateContextType {
  getAppState: () => any;
  subscribe: (callback: Callback) => Unsubscribe;
  setAppState: (state: any) => void;
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
