import React from 'react';
import { defineMessages } from 'react-intl';
import useAppContext from '@app/hooks/useAppContext';
import Button, { ButtonProps } from './Button';

type Title = 'add' | 'archive' | 'save';

interface FormButtonProps extends ButtonProps {
  title: Title;
}

const messages = defineMessages({
  add: {
    defaultMessage: 'Add',
    id: 'formButton.add',
  },
  save: {
    defaultMessage: 'Save',
    id: 'formButton.save',
  },
  archive: {
    defaultMessage: 'Archive',
    id: 'formButton.archive',
  },
});

const FormButton = ({ title: label, ...rest }: FormButtonProps) => {
  const { intl } = useAppContext();
  const assertNever = (label: never): never => {
    throw new Error(`Unexpected label: ${label}`);
  };
  const getTitle = (title: Title) => {
    switch (title) {
      case 'add':
        return intl.formatMessage(messages.add);
      case 'save':
        return intl.formatMessage(messages.save);
      case 'archive':
        return intl.formatMessage(messages.archive);
      default:
        return assertNever(title);
    }
  };

  return (
    <Button size="small" type="secondary" {...rest} title={getTitle(label)} />
  );
};

export default FormButton;
