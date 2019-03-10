import { StyleSheet } from 'react-native';
import { colors, LightTheme, dimensions } from './lightTheme';

const darkColors = {
  ...colors,
  background: '#272b33', // from overreacted.io
  foreground: '#ffffff',
};

const darkTheme = StyleSheet.create(new LightTheme(darkColors, dimensions));

export default darkTheme;
