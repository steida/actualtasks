import { Dimensions, Platform } from 'react-native';
import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import useAppContext from './useAppContext';

const useWindowWidth = () => {
  const { initialRender } = useAppContext();
  const windowWidth = useSubscription(
    useMemo(
      () => ({
        source: Dimensions,
        getCurrentValue: () =>
          Platform.select({
            web:
              initialRender || typeof window === 'undefined'
                ? 0
                : Dimensions.get('window').width,
            default: Dimensions.get('window').width,
          }),
        subscribe: (source: Dimensions, callback: any) => {
          source.addEventListener('change', callback);
          return () => {
            source.removeEventListener('change', callback);
          };
        },
      }),
      [initialRender],
    ),
  );

  return windowWidth;
};

export default useWindowWidth;
