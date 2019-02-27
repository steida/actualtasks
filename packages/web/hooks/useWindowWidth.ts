import { Dimensions, ScaledSize } from 'react-native';
import { useState, useEffect } from 'react';

// Null, because we can measure width only after client initial render.
let lastWindowWidth: number | null = null;

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState<number | null>(
    lastWindowWidth,
  );

  const setWindowWidthWithGlobal = (width: number) => {
    lastWindowWidth = width;
    setWindowWidth(width);
  };

  useEffect(() => {
    if (windowWidth != null) return;
    setWindowWidthWithGlobal(Dimensions.get('window').width);
  }, [setWindowWidthWithGlobal, windowWidth]);

  const handleDimensionChange = ({ window }: { window: ScaledSize }) => {
    setWindowWidthWithGlobal(window.width);
  };

  useEffect(() => {
    Dimensions.addEventListener('change', handleDimensionChange);
    return () => {
      Dimensions.removeEventListener('change', handleDimensionChange);
    };
  }, [handleDimensionChange]);

  return windowWidth;
};

export default useWindowWidth;
