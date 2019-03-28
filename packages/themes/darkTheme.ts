import { StyleSheet } from 'react-native';
import { colors, LightTheme, dimensions } from './lightTheme';

const darkColors = {
  ...colors,
  background: '#222',
  foreground: '#fff',
  taskBorder: colors.gray,
};

const darkTheme = StyleSheet.create(new LightTheme(darkColors, dimensions));

export default darkTheme;
