import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Text } from 'react-native';
import useAppContext from '../hooks/useAppContext';
import { Max1024CharsError, Max140CharsError } from '../validators/types';

// '%future added value' is reminder that GraphQL services often expand in
// capabilities and may return new enum values. It's generated by Relay.
// https://github.com/facebook/relay/issues/2351#issuecomment-368958022

interface ValidationErrorProps {
  error?: Max140CharsError | Max1024CharsError | null | '%future added value';
}

const ValidationError: React.FunctionComponent<ValidationErrorProps> = ({
  error,
}) => {
  const { theme } = useAppContext();

  const getMessage = () => {
    if (error == null) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleNever = (_: never | '%future added value') => {
      // This would be an implementation of assertNever with client data only:
      // throw new Error(`Unexpected validation error: ${error}`);
      // But we have to handle new enum values from the server.
      // Show nothing instead of showing "SOME_NEW_ERROR" is the best imho.
      // Meanwhile, the app should demand user action for an update.
      // https://github.com/facebook/relay/issues/2351#issuecomment-368958022
      return null;
    };
    switch (error) {
      case 'REQUIRED':
        return (
          <FormattedMessage
            id="ValidationError.required"
            defaultMessage="Please fill out this field."
          />
        );
      case 'MAX_140_CHARS':
      case 'MAX_1024_CHARS':
        return (
          <FormattedMessage
            id="ValidationError.maxLength"
            defaultMessage="{maxLength} characters maximum."
            values={{ maxLength: error === 'MAX_140_CHARS' ? 140 : 1024 }}
          />
        );
      default: {
        return handleNever(error);
      }
    }
  };

  return <Text style={theme.validationError}>{getMessage()}</Text>;
};

export default ValidationError;
