import { StyleSheet } from 'react-native';
import { colors, LightTheme, dimensions } from './lightTheme';

const darkColors = {
  ...colors,
  background: '#272b33', // from overreacted.io
  foreground: '#ffffff',
  taskBorder: colors.gray,
};

const darkTheme = StyleSheet.create(new LightTheme(darkColors, dimensions));

export default darkTheme;
