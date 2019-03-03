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
  // One weird trick, how to force null type. TypeScript otherwise always
  // returns TaskList. It should return TaskList | null imho.
  return taskLists[taskListId] != null ? taskLists[taskListId] : null;
};

export default useAppStateTaskListByRouter;
