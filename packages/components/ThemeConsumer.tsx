import React, { useCallback } from 'react';
import lightTheme, { Theme } from '@app/themes/lightTheme';
import darkTheme from '@app/themes/darkTheme';
import useClientState from '@app/clientstate/useClientState';

interface ThemeConsumer {
  children: (theme: Theme) => React.ReactElement<any>;
}

const ThemeConsumer: React.FunctionComponent<ThemeConsumer> = props => {
  const darkMode = useClientState(
    useCallback(state => state.viewer.darkMode, []),
  );
  return props.children(darkMode ? darkTheme : lightTheme);
};

export default ThemeConsumer;
