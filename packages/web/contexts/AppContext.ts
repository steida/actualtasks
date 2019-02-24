import React from 'react';
import { InjectedIntl } from 'react-intl';
import { Theme } from '@app/themes/lightTheme';

interface AppContext {
  intl: InjectedIntl;
  theme: Theme;
}

export default React.createContext<AppContext | null>(null);
