import { rootTaskListId } from '@app/state/appStateConfig';
import { TaskList } from '@app/state/types';
import usePageTitles from './usePageTitles';

const useTaskListTitle = (taskList: TaskList | null, noRoot?: boolean) => {
  const pageTitles = usePageTitles();
  return taskList == null
    ? pageTitles.notFound
    : noRoot !== true && taskList.id === rootTaskListId
    ? pageTitles.index
    : taskList.name;
};

export default useTaskListTitle;
