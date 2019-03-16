import { rootTaskListId } from '@app/state/appStateConfig';
import useAppContext from './useAppContext';

type TaskListId = string;

export type AppHref =
  | {
      pathname: '/';
      query?: { id: TaskListId } | null;
    }
  | 'https://twitter.com/steida'
  | 'https://github.com/steida/actualtasks'
  | 'https://blockstream.info/address/13fJfcXAZncP1NnMNtpG1KxEYL514jtUy3'
  | 'https://github.com/steida/actualtasks/issues/new'
  | '/me'
  | '/add'
  | {
      pathname: '/edit';
      query?: { id: TaskListId } | null;
    }
  | {
      pathname: '/blog';
      query?: { id: string } | null;
    }
  | '/help'
  | '/archived';

const useAppHref = () => {
  const { router } = useAppContext();
  const taskListId =
    (router != null &&
      router.query != null &&
      typeof router.query.id === 'string' &&
      router.query.id) ||
    rootTaskListId;

  return {
    push(href: AppHref) {
      router.push(href);
    },
    taskListId,
  };
};

export default useAppHref;
