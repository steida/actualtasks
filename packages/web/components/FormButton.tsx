import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button, { ButtonProps } from './Button';

type Label = 'add' | 'save';

interface FormButtonProps extends ButtonProps {
  label: Label;
}

const FormButton = ({ label, ...rest }: FormButtonProps) => {
  const assertNever = (label: never): never => {
    throw new Error(`Unexpected label: ${label}`);
  };
  const getLabel = (label: Label) => {
    switch (label) {
      case 'add':
        return <FormattedMessage defaultMessage="Add" id="buttonLabelAdd" />;
      case 'save':
        return <FormattedMessage defaultMessage="Save" id="buttonLabelSave" />;
      default:
        return assertNever(label);
    }
  };

  return (
    <Button size="small" type="secondary" {...rest}>
      {getLabel(label)}
    </Button>
  );
};

export default FormButton;
