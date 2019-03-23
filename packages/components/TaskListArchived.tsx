import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import { AppState } from '@app/state/types';
import TaskListBar from './TaskListBar';
import { LayoutScrollView } from './Layout';

interface TaskListArchivedProps {
  taskListId: string;
}

const TaskListArchived: FunctionComponent<TaskListArchivedProps> = ({
  taskListId,
}) => {
  const { theme } = useAppContext();
  const archivedSlate = useAppState(
    useCallback(
      ({ taskLists }: AppState) => {
        const taskList = taskLists.find(t => t.id === taskListId);
        return taskList != null ? taskList.archivedSlate : null;
      },
      [taskListId],
    ),
  );

  const sortedTasks = useMemo(() => {
    return archivedSlate == null
      ? []
      : // Sort mutates, therefore we need shallow clone.
        [...archivedSlate.document.nodes].sort((a, b) => {
          if (a.data.completedAt == null || b.data.completedAt == null)
            return 0;
          return a.data.completedAt - b.data.completedAt;
        });
  }, [archivedSlate]);

  return (
    <>
      <TaskListBar hasCompletedTask={false} dispatch={() => {}} />
      <LayoutScrollView>
        {sortedTasks.map(task => {
          return <Text style={theme.text}>{task.type}</Text>;
        })}
      </LayoutScrollView>
    </>
  );
};

export default TaskListArchived;
