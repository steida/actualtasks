import React from 'react';
import { InjectedIntl } from 'react-intl';
import { Theme } from '@app/themes/lightTheme';
import { SingletonRouter } from 'next/router';

interface AppContext {
  intl: InjectedIntl;
  theme: Theme;
  router: SingletonRouter;
}

export default React.createContext<AppContext | null>(null);
