import { rootTaskListId } from '@app/state/appStateConfig';
import useAppContext from './useAppContext';
import useAppState from './useAppState';

const useAppStateTaskListByRouter = () => {
  const { router } = useAppContext();
  const taskLists = useAppState(state => state.taskLists);
  const taskListId =
    (router &&
      router.query &&
      typeof router.query.id === 'string' &&
      router.query.id) ||
    rootTaskListId;
  return taskLists.find(t => t.id === taskListId);
};

export default useAppStateTaskListByRouter;
