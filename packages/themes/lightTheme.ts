// Typed styles are easily composable. Spread ftw.
// As for light / dark stuff:
//  1) We can have two themes. One light and one dark.
//  2) We can have one theme containing both light and dark colors.
//  3) We can have both.
// It means:
//  1) Start with semantic names. Like foreground and background colors.
//  2) Then add foreground-whatever (e.g. foreground-dark).
// That's all.
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// https://yeun.github.io/open-color/
export const colors = {
  background: '#fff',
  danger: '#fa5252',
  error: '#fa5252',
  foreground: 'rgb(31, 31, 31)',
  foregroundInverse: '#fff',
  gray: 'rgb(153, 163, 173)',
  grayLight: 'rgb(225, 225, 225)',
  primary: '#228be6',
  taskBorder: '#c7c7c7',
};

export const dimensions = {
  space: 24, // Like default lineHeight
  spaceBig: 48,
  spaceSmall: 12,
};

// https://www.modularscale.com/
export const ModularScale = {
  step0: 1,
  step1: 16 / 15,
  step2: 9 / 8,
  step3: 6 / 5,
  step4: 5 / 4,
  step5: 4 / 3,
  step6: Math.SQRT2,
  step7: 3 / 2,
  step8: 8 / 5,
  step9: 5 / 3,
  step10: 16 / 9,
  step11: 15 / 8,
  step12: 2,
  step13: 5 / 2,
  step14: 8 / 3,
  step15: 3,
  step16: 4,
};

const createTypography = ({
  fontSize,
  lineHeight,
  scale,
}: {
  fontSize: number;
  lineHeight: number;
  scale: keyof typeof ModularScale;
}) => {
  // http://inlehmansterms.net/2014/06/09/groove-to-a-vertical-rhythm
  const computeRhythmLineHeight = (modularFontSize: number) => {
    const lines = Math.ceil(modularFontSize / lineHeight);
    return lines * lineHeight;
  };
  return {
    fontSize,
    lineHeight,
    scale: (level: number) => {
      const modularFontSize = fontSize * ModularScale[scale] ** level;
      const rhythmLineHeight = computeRhythmLineHeight(modularFontSize);
      return {
        fontSize: modularFontSize,
        lineHeight: rhythmLineHeight,
      };
    },
  };
};

type Colors = typeof colors;
type Dimensions = typeof dimensions;

// No interface, because we extract Theme type from StyleSheet.create.
export class LightTheme {
  text: TextStyle;
  textSmall: TextStyle;
  textSmallGray: TextStyle;
  bold: TextStyle;
  noBold: TextStyle;
  marginBottom: ViewStyle;
  marginTop: ViewStyle;
  paragraph: TextStyle;
  heading1: TextStyle;
  heading2: TextStyle;
  layout: ViewStyle;
  layoutHeader: ViewStyle;
  layoutHeaderLink: TextStyle;
  layoutHeaderLinkActive: TextStyle;
  layoutBody: ViewStyle;
  layoutBodyContent: ViewStyle;
  layoutMenuScrollViewContent: ViewStyle;
  layoutMenuScrollViewSmallScreen: ViewStyle;
  layoutMenuScrollViewOtherScreen: ViewStyle;
  layoutContentScrollView: ViewStyle;
  layoutContentScrollViewContent: ViewStyle;
  layoutFooter: ViewStyle;
  link: TextStyle;
  linkActive: TextStyle;
  linkImageActive: ViewStyle;
  spacer: ViewStyle;
  borderGrayLight: ViewStyle;
  textInputOutline: TextStyle;
  textInputOutlineSmall: TextStyle;
  flexRow: ViewStyle;
  flexColumn: ViewStyle;
  buttons: ViewStyle;
  button: TextStyle;
  buttonGray: TextStyle;
  buttonBig: TextStyle;
  buttonSmall: TextStyle;
  buttonPrimary: TextStyle;
  buttonDanger: TextStyle;
  buttonSecondary: TextStyle;
  buttonDisabled: TextStyle;
  validationError: TextStyle;
  marginStartAuto: ViewStyle;
  label: TextStyle;
  labelInvalid: TextStyle;
  task: ViewStyle;
  taskCheckbox: ViewStyle;
  taskCheckboxSvg: TextStyle;
  taskDepth0: ViewStyle;
  taskDepth1: ViewStyle;
  taskDepth2: ViewStyle;
  taskDepth3: ViewStyle;
  taskDepth4: ViewStyle;
  taskDepth5: ViewStyle;
  taskDepth6: ViewStyle;
  taskDepth7: ViewStyle;
  taskDepth8: ViewStyle;
  taskDepth9: ViewStyle;
  lineThrough: TextStyle;
  flex1: ViewStyle;
  marginHorizontal: ViewStyle;
  marginVertical: ViewStyle;
  paddingHorizontal: ViewStyle;
  negativeMarginHorizontal: ViewStyle;
  blogPostTitle: TextStyle;
  blogPostTitleLink: TextStyle;
  blogPostReadMoreLink: TextStyle;
  focusOutlineWeb: ViewStyle;
  opacity0: ViewStyle;
  taskListBar: ViewStyle;
  taskListBarLink: TextStyle;
  taskListBarLinkActive: TextStyle;

  constructor(colors: Colors, dimensions: Dimensions) {
    const typography = createTypography({
      fontSize: 16,
      lineHeight: 24,
      // fontSize: 18,
      // lineHeight: 27,
      // fontSize: 20,
      // lineHeight: 30,
      scale: 'step5',
    });

    this.text = {
      color: colors.foreground,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      ...typography.scale(0),
    };

    this.textSmall = {
      ...this.text,
      ...typography.scale(-1),
    };

    this.textSmallGray = {
      ...this.textSmall,
      color: colors.gray,
    };

    this.bold = {
      fontWeight: 'bold',
    };

    this.noBold = {
      fontWeight: 'normal',
    };

    this.marginBottom = {
      marginBottom: typography.lineHeight,
    };

    this.marginTop = {
      marginTop: typography.lineHeight,
    };

    this.paragraph = {
      ...this.text,
      ...this.marginBottom,
    };

    this.heading1 = {
      ...this.text,
      ...this.marginBottom,
      ...typography.scale(2),
      color: colors.gray,
      fontWeight: 'bold',
    };

    this.heading2 = {
      ...this.heading1,
      ...typography.scale(1),
    };

    this.link = {
      // Link does not extend text, because link can be in any text and inherits
      // it's styles like fontFamily and fontSize. Therefore, Link must be always
      // wrapped by Text.
      color: colors.primary,
    };

    this.linkActive = {
      textDecorationLine: 'underline',
    };

    this.linkImageActive = {
      opacity: 0.7,
    };

    this.spacer = {
      width: dimensions.spaceSmall,
    };

    this.layout = {
      backgroundColor: colors.background,
      flex: 1,
      // No padding nor margin here. We need full width because of scrollbar.
    };

    this.layoutHeader = {
      justifyContent: 'flex-end',
      flexDirection: 'row',
      padding: dimensions.space,
      marginHorizontal: -dimensions.spaceSmall,
    };

    this.layoutHeaderLink = {
      ...this.textSmallGray,
      marginHorizontal: dimensions.spaceSmall,
    };

    this.layoutHeaderLinkActive = {
      ...this.link,
    };

    this.layoutBody = {
      flex: 1,
    };

    // Add small space padding to ensure a focus outline is always visible
    // within scrollable content, because scrollview has an overflow hidden.
    const layoutScrollViewContentPaddding = {
      padding: dimensions.spaceSmall,
    };

    this.layoutBodyContent = {
      flex: 1,
    };

    this.layoutMenuScrollViewSmallScreen = {
      flexGrow: 0,
    };

    this.layoutMenuScrollViewOtherScreen = {
      maxWidth: typography.fontSize * 10,
      paddingHorizontal: dimensions.spaceSmall,
    };

    this.layoutMenuScrollViewContent = {
      ...layoutScrollViewContentPaddding,
    };

    this.layoutContentScrollView = {
      flex: 1,
      ...layoutScrollViewContentPaddding,
    };

    const layoutContentMaxWidth = 800;

    this.layoutContentScrollViewContent = {
      maxWidth: layoutContentMaxWidth,
    };

    this.layoutFooter = {
      paddingVertical: dimensions.space,
    };

    this.borderGrayLight = {
      borderColor: colors.grayLight,
      borderRadius: 5,
      borderStyle: 'solid',
      borderWidth: 1,
    };

    this.textInputOutline = {
      ...this.text,
      ...this.borderGrayLight,
      paddingHorizontal: typography.lineHeight / 2,
      paddingVertical: typography.lineHeight / 4,
      width: typography.fontSize * 16,
    };

    this.textInputOutlineSmall = {
      ...this.textSmall,
      ...this.borderGrayLight,
      paddingHorizontal: typography.lineHeight / 4,
      width: '100%',
    };

    this.flexRow = {
      flexDirection: 'row',
    };

    this.flexColumn = {
      flexDirection: 'column',
    };

    this.buttons = {
      ...this.flexRow,
      marginHorizontal: -(typography.lineHeight / 4),
    };

    this.button = {
      ...this.text,
      marginHorizontal: typography.lineHeight / 4,
    };

    this.buttonGray = {
      ...this.button,
      color: colors.gray,
    };

    this.buttonBig = {
      ...typography.scale(2),
    };

    this.buttonSmall = {
      ...typography.scale(-1),
      ...this.bold,
    };

    // Button helper styles. It can be refactored but this is fine enough.
    const buttonPadding = {
      paddingHorizontal: typography.lineHeight / 2,
      paddingVertical: typography.lineHeight / 8,
    };

    const buttonBorderPrimary = {
      ...this.borderGrayLight,
      borderColor: colors.primary,
    };

    const buttonBorderDanger = {
      ...this.borderGrayLight,
      borderColor: colors.danger,
    };

    this.buttonPrimary = {
      ...this.button,
      ...buttonPadding,
      ...buttonBorderPrimary,
      backgroundColor: colors.primary,
      color: colors.foregroundInverse,
    };

    this.buttonDanger = {
      ...this.button,
      ...buttonPadding,
      ...buttonBorderDanger,
      backgroundColor: colors.danger,
      color: colors.foregroundInverse,
    };

    this.buttonSecondary = {
      ...this.button,
      ...buttonPadding,
      ...this.borderGrayLight,
    };

    this.buttonDisabled = {
      opacity: 0.75,
    };

    this.validationError = {
      ...this.textSmall,
      color: colors.error,
      fontWeight: 'bold',
      minHeight: typography.lineHeight,
    };

    this.marginStartAuto = {
      marginStart: 'auto',
    };

    this.label = {
      ...this.textSmall,
      color: colors.gray,
      padding: typography.lineHeight / 6,
      // @ts-ignore Because it was added in RN56.
      textTransform: 'uppercase',
    };

    this.labelInvalid = {
      color: colors.danger,
    };

    this.task = {
      flexDirection: 'row',
    };

    this.taskCheckbox = {
      width: typography.lineHeight / 2,
      height: typography.lineHeight / 2,
      marginTop: typography.lineHeight / 4,
      marginBottom: typography.lineHeight / 4,
      marginRight: typography.lineHeight / 3,
      top: 1,
      borderRadius: 3,
      borderStyle: 'solid',
      borderColor: colors.taskBorder,
      borderWidth: 1,
    };

    this.taskCheckboxSvg = {
      // React Native does not support SVG CSS but we want them in theme. Let's cheat.
      // Instead of fill:
      display: 'none',
      // Instead of stroke:
      color: colors.foreground,
      // Instead of strokeWidth:
      width: '4px',
    };

    const createTaskDepthStyle = (depth: number): ViewStyle => ({
      marginStart: depth * typography.lineHeight,
    });

    this.taskDepth0 = createTaskDepthStyle(0);
    this.taskDepth1 = createTaskDepthStyle(1);
    this.taskDepth2 = createTaskDepthStyle(2);
    this.taskDepth3 = createTaskDepthStyle(3);
    this.taskDepth4 = createTaskDepthStyle(4);
    this.taskDepth5 = createTaskDepthStyle(5);
    this.taskDepth6 = createTaskDepthStyle(6);
    this.taskDepth7 = createTaskDepthStyle(7);
    this.taskDepth8 = createTaskDepthStyle(8);
    this.taskDepth9 = createTaskDepthStyle(9);

    this.lineThrough = {
      textDecorationLine: 'line-through',
    };

    this.flex1 = {
      flex: 1,
    };

    this.marginHorizontal = {
      marginHorizontal: typography.lineHeight / 4,
    };

    this.marginVertical = {
      marginVertical: typography.lineHeight / 4,
    };

    this.paddingHorizontal = {
      paddingHorizontal: typography.lineHeight / 4,
    };

    this.negativeMarginHorizontal = {
      marginHorizontal: -(typography.lineHeight / 4),
    };

    this.blogPostTitle = {
      ...this.heading2,
      color: colors.foreground,
      marginBottom: 0,
    };

    this.blogPostTitleLink = {
      ...this.blogPostTitle,
      ...this.link,
      ...this.noBold,
    };

    this.blogPostReadMoreLink = {
      ...this.textSmallGray,
    };

    this.focusOutlineWeb = {
      // @ ts-ignore TODO: Only for web via platform.
      // outline: `1px dotted ${colors.gray}`,
      outlineColor: colors.gray,
      outlineStyle: 'dotted',
      outlineWidth: 1,
    };

    this.opacity0 = {
      opacity: 0,
    };

    this.taskListBar = {
      paddingHorizontal: dimensions.spaceSmall,
      position: 'absolute',
      left: 0,
      width: layoutContentMaxWidth,
      height: typography.lineHeight,
      top: -typography.lineHeight,
      flexDirection: 'row',
    };

    this.taskListBarLink = {
      ...this.buttonGray,
      ...this.buttonSmall,
      ...this.buttonDisabled,
    };

    this.taskListBarLinkActive = {
      color: colors.foreground,
    };
  }
}

const lightTheme = StyleSheet.create(new LightTheme(colors, dimensions));
export type Theme = typeof lightTheme;

export default lightTheme;
