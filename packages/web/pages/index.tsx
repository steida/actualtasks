import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { Text } from 'react-native';
import { AppState } from '@app/state/types';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import useAppStateTaskListByRouter from '../hooks/useAppStateTaskListByRouter';
import useTaskListTitle from '../hooks/useTaskListTitle';
import TaskList from '../components/TaskList';
import useAppState from '../hooks/useAppState';

interface MaybeTaskListProps {
  title: string;
  taskListId: string | undefined;
}

const TaskListOrNotFound: FunctionComponent<MaybeTaskListProps> = ({
  title,
  taskListId,
}) => {
  const { theme } = useAppContext();
  const taskListSelector = useCallback(
    (state: AppState) => state.taskLists.find(t => t.id === taskListId),
    [taskListId],
  );
  const taskList = useAppState(taskListSelector);
  if (taskList == null) return <Text style={theme.text}>{title}</Text>;
  /* https://twitter.com/estejs/status/1102238792382062593 */
  return <TaskList taskList={taskList} key={taskList.id} />;
};

const Index: FunctionComponent = () => {
  const taskList = useAppStateTaskListByRouter();
  const title = useTaskListTitle(taskList);
  const taskListId = taskList && taskList.id;

  // Render Layout only when necessary. This prevents rerender the whole Layout
  // when some unrelated data are chagned.
  return useMemo(
    () => (
      <Layout title={title}>
        <TaskListOrNotFound title={title} taskListId={taskListId} />
      </Layout>
    ),
    [taskListId, title],
  );
};

export default Index;
