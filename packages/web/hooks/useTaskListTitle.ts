import { rootTaskListId } from '@app/state/appStateConfig';
import { TaskList } from '@app/state/types';
import usePageTitles from './usePageTitles';

const useTaskListTitle = (taskList: TaskList | null) => {
  const pageTitles = usePageTitles();
  return taskList == null
    ? pageTitles.notFound
    : taskList.id === rootTaskListId
    ? pageTitles.index
    : taskList.name;
};

export default useTaskListTitle;
