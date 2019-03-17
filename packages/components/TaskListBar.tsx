import React, { FunctionComponent, Dispatch, memo, useCallback } from 'react';
import { View } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import { defineMessages } from 'react-intl';
import Button, { ButtonProps } from './Button';
import Link from './Link';
import { Action } from './TaskList';

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

interface TaskListBarProps {
  hasCompletedTask: boolean;
  dispatch: Dispatch<Action>;
}

const TaskListBar: FunctionComponent<TaskListBarProps> = memo(
  ({ hasCompletedTask, dispatch }) => {
    const { theme, intl } = useAppContext();

    const handleClearCompletedPress = useCallback(() => {
      dispatch({ type: 'clearCompleted' });
    }, [dispatch]);

    return (
      <View style={theme.taskListBar}>
        <View style={theme.buttons}>
          <TaskListBarButton
            title={intl.formatMessage(messages.clearCompleted)}
            disabled={!hasCompletedTask}
            type="gray"
            onPress={handleClearCompletedPress}
          />
          <Link style={[theme.buttonGray, theme.buttonSmall]} href="/me">
            {intl.formatMessage(messages.completed)}
          </Link>
        </View>
      </View>
    );
  },
);

export default TaskListBar;
