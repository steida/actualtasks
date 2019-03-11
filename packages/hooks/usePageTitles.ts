import { defineMessages } from 'react-intl';
import { useMemo } from 'react';
import useAppContext from '@app/hooks/useAppContext';

export const pageTitles = defineMessages({
  index: {
    defaultMessage: 'Actual Tasks',
    id: 'pageTitles.index',
  },
  me: {
    defaultMessage: 'Me',
    id: 'pageTitles.me',
  },
  add: {
    defaultMessage: 'Add',
    id: 'pageTitles.add',
  },
  edit: {
    defaultMessage: 'Edit: {name}',
    id: 'pageTitles.edit',
  },
  notFound: {
    defaultMessage: 'Not found.',
    id: 'pageTitles.notFound',
  },
  blog: {
    defaultMessage: 'Blog - Actual Tasks',
    id: 'pageTitles.blog',
  },
  help: {
    defaultMessage: 'Help - Actual Tasks',
    id: 'pageTitles.help',
  },
});

// Page titles can not be collocated within pages because that would defeat
// code splitting. One nav component would import many pages.
const usePageTitles = () => {
  const { intl } = useAppContext();
  const titles = useMemo(() => {
    return {
      // Note we can add function for formatMessage values.
      index: intl.formatMessage(pageTitles.index),
      me: intl.formatMessage(pageTitles.me),
      add: intl.formatMessage(pageTitles.add),
      edit: (name: string) => intl.formatMessage(pageTitles.edit, { name }),
      notFound: intl.formatMessage(pageTitles.notFound),
      blog: intl.formatMessage(pageTitles.blog),
      help: intl.formatMessage(pageTitles.help),
    };
  }, [intl]);
  return titles;
};

export default usePageTitles;
