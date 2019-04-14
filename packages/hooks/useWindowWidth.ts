import { Dimensions, Platform } from 'react-native';
import { useCallback } from 'react';
import { useSubscription } from './useSubscription';
import useAppContext from './useAppContext';

const useWindowWidth = () => {
  const { initialRender } = useAppContext();

  const getCurrentValue = useCallback(() => {
    return Platform.select({
      web:
        initialRender || typeof window === 'undefined'
          ? 0
          : Dimensions.get('window').width,
      default: Dimensions.get('window').width,
    });
  }, [initialRender]);

  const subscribe = useCallback((callback: () => void) => {
    Dimensions.addEventListener('change', callback);
    return () => {
      Dimensions.removeEventListener('change', callback);
    };
  }, []);

  const value = useSubscription({ getCurrentValue, subscribe });

  return value;
};

export default useWindowWidth;
