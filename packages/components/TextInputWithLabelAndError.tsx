import React, { FunctionComponent, ReactNode } from 'react';
import { Text, TextInput } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import ValidationError, { ValidationErrorType } from './ValidationError';

interface TextInputWithLabelAndErrorProps {
  autoFocus?: boolean;
  value: string;
  onChangeText: (text: string) => any;
  error: ValidationErrorType;
  onSubmitEditing?: () => any;
  label: ReactNode;
  maxLength: 'short' | 'medium';
}

const TextInputWithLabelAndError: FunctionComponent<
  TextInputWithLabelAndErrorProps
> = props => {
  const { theme } = useAppContext();
  return (
    <>
      <Text style={theme.label}>{props.label}</Text>
      <TextInput
        autoFocus={props.autoFocus}
        onChangeText={props.onChangeText}
        style={theme.textInputOutline}
        enablesReturnKeyAutomatically
        blurOnSubmit={false}
        onSubmitEditing={props.onSubmitEditing}
        value={props.value}
        maxLength={props.maxLength === 'short' ? 32 : 1024}
      />
      <ValidationError error={props.error} />
    </>
  );
};

export default TextInputWithLabelAndError;
