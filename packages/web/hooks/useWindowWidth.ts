import { Dimensions, ScaledSize } from 'react-native';
import { useState, useEffect, useCallback } from 'react';

// Null, because we can measure width only after client initial render.
let lastWindowWidth: number | null = null;

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState<number | null>(
    lastWindowWidth,
  );

  const setWindowWidthWithGlobal = useCallback((width: number) => {
    lastWindowWidth = width;
    setWindowWidth(width);
  }, []);

  useEffect(() => {
    if (windowWidth != null) return;
    setWindowWidthWithGlobal(Dimensions.get('window').width);
  }, [setWindowWidthWithGlobal, windowWidth]);

  const handleDimensionChange = useCallback(
    ({ window }: { window: ScaledSize }) => {
      setWindowWidthWithGlobal(window.width);
    },
    [setWindowWidthWithGlobal],
  );

  useEffect(() => {
    Dimensions.addEventListener('change', handleDimensionChange);
    return () => {
      Dimensions.removeEventListener('change', handleDimensionChange);
    };
  }, [handleDimensionChange]);

  return windowWidth;
};

export default useWindowWidth;
