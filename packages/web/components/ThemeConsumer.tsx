import React from 'react';
import useAppState from '../hooks/useAppState';
import darkTheme from '../themes/dark';
import lightTheme, { Theme } from '../themes/light';

interface ThemeConsumer {
  children: (theme: Theme) => React.ReactElement<any>;
}

const ThemeConsumer: React.FunctionComponent<ThemeConsumer> = props => {
  const [viewer] = useAppState(state => state.viewer);
  return props.children(viewer.darkMode ? darkTheme : lightTheme);
};

export default ThemeConsumer;
