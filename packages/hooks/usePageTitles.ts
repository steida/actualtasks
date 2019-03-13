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
    defaultMessage: 'Not found',
    id: 'pageTitles.notFound',
  },
  blog: {
    defaultMessage: 'Blog',
    id: 'pageTitles.blog',
  },
  help: {
    defaultMessage: 'Help',
    id: 'pageTitles.help',
  },
  archived: {
    defaultMessage: 'Archived',
    id: 'pageTitles.help',
  },
});

// Page titles can not be collocated within pages because that would defeat
// code splitting. One nav component would import many pages.
const usePageTitles = () => {
  const { intl } = useAppContext();
  return useMemo(() => {
    const index = intl.formatMessage(pageTitles.index);
    // @ts-ignore
    const format = (...args) => {
      // @ts-ignore
      return `${intl.formatMessage(...args)} - ${index}`;
    };

    const titles = {
      index,
      me: format(pageTitles.me),
      add: format(pageTitles.add),
      edit: (name: string) => format(pageTitles.edit, { name }),
      notFound: format(pageTitles.notFound),
      blog: format(pageTitles.blog),
      help: format(pageTitles.help),
      archived: format(pageTitles.archived),
    };
    return titles;
  }, [intl]);
};

export default usePageTitles;
