import { rootTaskListId } from '@app/state/appStateConfig';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from './useAppState';

const useAppStateTaskListByRouter = () => {
  const { router } = useAppContext();
  const taskListId =
    (router &&
      router.query &&
      typeof router.query.id === 'string' &&
      router.query.id) ||
    rootTaskListId;
  const taskList = useAppState(state =>
    state.taskLists.find(t => t.id === taskListId),
  );
  return taskList;
};

export default useAppStateTaskListByRouter;
