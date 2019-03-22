import React, { FunctionComponent } from 'react';
import { Text } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';

interface TaskListArchivedProps {
  taskListId: string;
}

const TaskListArchived: FunctionComponent<TaskListArchivedProps> = () => {
  const { theme } = useAppContext();
  return <Text style={theme.text}>TaskListArchived</Text>;
};

export default TaskListArchived;
