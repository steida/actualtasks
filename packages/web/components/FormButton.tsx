import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button, { ButtonProps } from './Button';

type Label = 'add' | 'archive' | 'save';

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
      case 'archive':
        return (
          <FormattedMessage defaultMessage="Archive" id="buttonLabelArchive" />
        );
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
