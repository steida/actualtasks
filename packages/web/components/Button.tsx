import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import useAppContext from '../hooks/useAppContext';

// This is mess.
type Type = 'text' | 'primary' | 'secondary' | 'danger' | 'gray';

type Size = 'big' | 'normal' | 'small';

interface ButtonProps extends TouchableOpacityProps {
  size?: Size;
  type?: Type;
}

const Button: React.FunctionComponent<ButtonProps> = props => {
  const { theme } = useAppContext();
  const { disabled, type = 'text', size = 'normal', ...rest } = props;

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

  return (
    <TouchableOpacity disabled={disabled} {...rest} accessibilityRole="button">
      <Text
        style={[
          getStyle(type),
          disabled && theme.buttonDisabled,
          size === 'big' && theme.buttonBig,
          size === 'small' && theme.buttonSmall,
        ]}
      >
        {props.children}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
