import React, {
  useRef,
  useState,
  useEffect,
  FunctionComponent,
  useCallback,
} from 'react';
import {
  Animated,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ScaledSize,
} from 'react-native';
import useAppContext from '../hooks/useAppContext';

interface SidebarButtonProps extends TouchableOpacityProps {
  active?: boolean;
}

const SidebarButton: FunctionComponent<SidebarButtonProps> = props => {
  const { theme } = useAppContext();
  const { active, children, ...rest } = props;
  const textStyle = active ? theme.textSmall : theme.textSmallGray;
  return (
    <TouchableOpacity {...rest}>
      <Text style={textStyle}>{props.children}</Text>
    </TouchableOpacity>
  );
};

// Rename to Siderbar or TabBar?
const Sidebar: FunctionComponent = () => {
  const { theme } = useAppContext();
  const viewRef = useRef<View>(null);
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [isCroppedFromLeft, setIsCroppedFromLeft] = useState(false);
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (windowWidth != null) return;
    const window = Dimensions.get('window');
    setWindowWidth(window.width);
  }, [windowWidth]);

  useEffect(() => {
    if (windowWidth == null) return;
    if (viewRef.current == null) return;
    let isMounted = true;
    viewRef.current.measureInWindow(x => {
      if (isMounted) setIsCroppedFromLeft(x < 0);
    });
    return () => {
      isMounted = false;
    };
  }, [windowWidth]);

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isCroppedFromLeft ? 0 : 1,
      duration: 250,
    }).start();
  }, [isCroppedFromLeft, opacityAnim]);

  // We memoize callback for useEffect deps. Probably unnecessary, but who knows.
  const handleDimensionChange = useCallback(
    ({ window }: { window: ScaledSize }) => {
      setWindowWidth(window.width);
    },
    [],
  );

  useEffect(() => {
    Dimensions.addEventListener('change', handleDimensionChange);
    return () => {
      Dimensions.removeEventListener('change', handleDimensionChange);
    };
  }, [handleDimensionChange]);

  return (
    <View ref={viewRef} style={[theme.sidebar]}>
      <Animated.View style={{ opacity: opacityAnim }}>
        <SidebarButton active>actual</SidebarButton>
        <SidebarButton>práce</SidebarButton>
        <SidebarButton>dovolená</SidebarButton>
      </Animated.View>
    </View>
  );
};

export default Sidebar;
