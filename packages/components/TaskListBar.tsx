import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import { defineMessages } from 'react-intl';
import useAppState from '@app/hooks/useAppState';
import Button, { ButtonProps } from './Button';
import Link from './Link';

const messages = defineMessages({
  clearCompleted: {
    defaultMessage: 'Clear Completed',
    id: 'taskListBar.clearCompleted',
  },
  completed: {
    defaultMessage: 'completed',
    id: 'taskListBar.completed',
  },
});

const TaskListBarButton: FunctionComponent<ButtonProps> = props => {
  return <Button type="gray" size="small" {...props} />;
};

interface ClearCompletedButtonProps {
  taskListId: string;
}

const ClearCompletedButton: FunctionComponent<ClearCompletedButtonProps> = ({
  taskListId,
}) => {
  const { intl } = useAppContext();
  const disabled = useAppState(({ taskLists }) => {
    const taskList = taskLists.find(t => t.id === taskListId);
    if (!taskList) return true;
    return !taskList.slate.document.nodes.some(node => node.data.completed);
  });
  // potrebuju rict neco, asi reducer?
  const handlePress = () => {
    // dispatch({ type: 'clearCompleted' })
    // console.log('f');
  };

  return (
    <TaskListBarButton
      title={intl.formatMessage(messages.clearCompleted)}
      disabled={disabled}
      type="text"
      onPress={handlePress}
    />
  );
};

interface TaskListBarProps {
  taskListId: string;
}

const TaskListBar: FunctionComponent<TaskListBarProps> = ({ taskListId }) => {
  const { theme, intl } = useAppContext();
  return (
    <View style={theme.taskListBar}>
      <View style={theme.buttons}>
        <ClearCompletedButton taskListId={taskListId} />
        <Link style={[theme.buttonGray, theme.buttonSmall]} href="/me">
          {intl.formatMessage(messages.completed)}
        </Link>
      </View>
    </View>
  );
};

export default TaskListBar;
