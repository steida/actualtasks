import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import darkTheme from '../themes/dark';
import lightTheme, { Theme } from '../themes/light';

interface ThemeConsumer {
  children: (theme: Theme) => React.ReactElement<any>;
}

const ThemeConsumer: React.FunctionComponent<ThemeConsumer> = props => {
  const [darkMode] = useLocalStorage('darkMode');
  return props.children(darkMode ? darkTheme : lightTheme);
};

export default ThemeConsumer;
