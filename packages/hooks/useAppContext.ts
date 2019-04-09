import React from 'react';

import { InjectedIntl } from 'react-intl';
import { Theme } from '@app/themes/lightTheme';
import { SingletonRouter } from 'next/router';

interface AppContext {
  intl: InjectedIntl;
  theme: Theme;
  router: SingletonRouter;
  initialRender: boolean;
  logout: () => void;
}

export const AppContext = React.createContext<AppContext | null>(null);

const useAppContext = () => {
  const appContext = React.useContext(AppContext);
  if (appContext == null)
    throw Error('useAppContext: Please provide AppContext value.');
  return appContext;
};

export default useAppContext;
