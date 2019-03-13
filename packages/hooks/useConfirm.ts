import { defineMessages } from 'react-intl';
import useAppContext from '@app/hooks/useAppContext';
import { useCallback } from 'react';

const messages = defineMessages({
  areYouSure: {
    defaultMessage: 'Are you sure?',
    id: 'confirm.areYouSure',
  },
});

const useConfirm = () => {
  const { intl } = useAppContext();

  const confirm = useCallback(() => {
    // eslint-disable-next-line
    return window.confirm(intl.formatMessage(messages.areYouSure));
  }, [intl]);

  return confirm;
};

export default useConfirm;
