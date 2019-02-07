import React from 'react';
import { InjectedIntl } from 'react-intl';
import { MyAppState } from '../pages/_app';
import { Theme } from '../themes/light';

interface AppContext {
  appState: MyAppState;
  intl: InjectedIntl;
  setAppState: (callback: (state: MyAppState) => MyAppState) => void;
  theme: Theme;
}

export default React.createContext<AppContext | null>(null);
