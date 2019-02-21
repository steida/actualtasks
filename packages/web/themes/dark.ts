import { StyleSheet } from 'react-native';
import { colors, createTheme, dimensions } from './light';

export const name = 'dark';

const darkColors = {
  ...colors,
  background: '#362714', // from VSCode Kimbie Dark
  // background: '#343a40',
  foreground: '#ffffff',
};

const theme = StyleSheet.create(createTheme(darkColors, dimensions));

export default theme;
