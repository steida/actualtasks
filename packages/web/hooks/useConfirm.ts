import { defineMessages } from 'react-intl';
import useAppContext from './useAppContext';

const messages = defineMessages({
  areYouSure: {
    defaultMessage: 'Are you sure?',
    id: 'confirm.areYouSure',
  },
});

const useConfirm = () => {
  const { intl } = useAppContext();

  const confirm = () => {
    // eslint-disable-next-line
    return window.confirm(intl.formatMessage(messages.areYouSure));
  };

  return confirm;
};

export default useConfirm;
