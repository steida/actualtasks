import useWindowWidth from './useWindowWidth';

// https://medium.freecodecamp.org/the-100-correct-way-to-do-css-breakpoints-88d6a5ba1862

const ranges = {
  phoneOnly: 599,
  tabletPortraitUp: 600,
  tabletLandscapeUp: 900,
  desktopUp: 1200,
  bigDesktopUp: 1800,
};

type ScreenSize = { [P in keyof typeof ranges]: boolean };

const useScreenSize = (): ScreenSize => {
  const windowWidth = useWindowWidth();
  // Return the smallest screen on the server so we render as less as possible.
  if (windowWidth == null)
    return {
      phoneOnly: true,
      tabletPortraitUp: false,
      tabletLandscapeUp: false,
      desktopUp: false,
      bigDesktopUp: false,
    };

  return {
    phoneOnly: windowWidth <= ranges.phoneOnly,
    tabletPortraitUp: windowWidth > ranges.tabletPortraitUp,
    tabletLandscapeUp: windowWidth > ranges.tabletLandscapeUp,
    desktopUp: windowWidth > ranges.desktopUp,
    bigDesktopUp: windowWidth > ranges.bigDesktopUp,
  };
};

export default useScreenSize;
