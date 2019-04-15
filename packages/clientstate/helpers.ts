import nanoid from 'nanoid';
import { TaskList } from './types';

// Async, because of https://github.com/ai/nanoid#react-native
export const createTaskList = async (name: string) => {
  return {
    id: nanoid(),
    name,
    createdAt: Date.now(),
  };
};

export const getSortedNotArchivedTaskLists = (taskLists: {
  [key: string]: TaskList | null;
}): TaskList[] =>
  Object.values(taskLists)
    .filter((taskList): taskList is TaskList => taskList != null)
    .filter(taskList => taskList.archivedAt == null)
    .sort((a, b) => a.createdAt - b.createdAt);
