import { useCallback } from 'react';
import { AppState } from '@app/state/types';
import useAppHref from './useAppHref';
import useAppState from './useAppState';

// We have to check whether the task list exists.
// Note we get only task list id to prevent unnecessary rerenders.
const useAppHrefTaskListId = () => {
  const appHref = useAppHref();
  const taskListId = useAppState(
    useCallback(
      ({ taskLists }: AppState) => {
        const taskList = taskLists.find(t => t.id === appHref.taskListId);
        return taskList != null ? taskList.id : null;
      },
      [appHref.taskListId],
    ),
  );
  return taskListId;
};

export default useAppHrefTaskListId;
