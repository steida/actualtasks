import { StyleSheet } from 'react-native';
import { colors, LightTheme, dimensions } from './lightTheme';

const darkColors = {
  ...colors,
  background: '#362714', // from VSCode Kimbie Dark
  // background: '#343a40',
  foreground: '#ffffff',
};

const darkTheme = StyleSheet.create(new LightTheme(darkColors, dimensions));

export default darkTheme;
