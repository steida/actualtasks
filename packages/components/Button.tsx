import React, { useState, useCallback, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  Platform,
} from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import title from 'title';

type Type = 'text' | 'primary' | 'secondary' | 'danger' | 'gray';

type Size = 'big' | 'normal' | 'small';

export interface ButtonProps extends TouchableOpacityProps {
  size?: Size;
  type?: Type;
  title?: string;
}

const Button: React.FunctionComponent<ButtonProps> = props => {
  const { theme } = useAppContext();
  const { type = 'text', size = 'normal', title: buttonTitle, ...rest } = props;

  const getStyle = (type: Type) => {
    const assertNever = (type: never) => {
      throw new Error(`Unexpected Button type: ${type}`);
    };
    switch (type) {
      case 'text':
        return theme.button;
      case 'gray':
        return theme.buttonGray;
      case 'primary':
        return theme.buttonPrimary;
      case 'secondary':
        return theme.buttonSecondary;
      case 'danger':
        return theme.buttonDanger;
      default:
        return assertNever(type);
    }
  };

  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    if (props.disabled) setHasFocus(false);
  }, [props.disabled]);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
  }, []);

  return (
    <TouchableOpacity
      {...rest}
      accessibilityRole="button"
      {...Platform.select({
        web: {
          onFocus: handleFocus,
          onBlur: handleBlur,
        },
      })}
    >
      <Text
        style={[
          getStyle(type),
          props.disabled && theme.buttonDisabled,
          size === 'big' && theme.buttonBig,
          size === 'small' && theme.buttonSmall,
          hasFocus && theme.focusOutlineWeb,
        ]}
      >
        {buttonTitle && title(buttonTitle)}
        {props.children}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
