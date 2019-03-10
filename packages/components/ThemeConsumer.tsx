import React from 'react';
import lightTheme, { Theme } from '@app/themes/lightTheme';
import darkTheme from '@app/themes/darkTheme';
import useAppState from '@app/hooks/useAppState';

interface ThemeConsumer {
  children: (theme: Theme) => React.ReactElement<any>;
}

const ThemeConsumer: React.FunctionComponent<ThemeConsumer> = props => {
  const darkMode = useAppState(state => state.viewer.darkMode);
  const theme = darkMode ? darkTheme : lightTheme;
  return props.children(theme);
};

export default ThemeConsumer;
