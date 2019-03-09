import { rootTaskListId } from '@app/state/appStateConfig';
import { TaskList } from '@app/state/types';
import usePageTitles from '@app/hooks/usePageTitles';

const useTaskListTitle = (taskList: TaskList | undefined, noRoot?: boolean) => {
  const pageTitles = usePageTitles();
  return taskList == null
    ? pageTitles.notFound
    : noRoot !== true && taskList.id === rootTaskListId
    ? pageTitles.index
    : taskList.name;
};

export default useTaskListTitle;
