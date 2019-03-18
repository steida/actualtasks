import React, { FunctionComponent, Dispatch, memo, useCallback } from 'react';
import { View } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import { defineMessages } from 'react-intl';
import Button, { ButtonProps } from './Button';
import Link from './Link';
import { Action } from './TaskList';

const messages = defineMessages({
  archive: {
    defaultMessage: 'Archive',
    id: 'taskListBar.archive',
  },
  archived: {
    defaultMessage: 'archived',
    id: 'taskListBar.archived',
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

    const handleArchivePress = useCallback(() => {
      dispatch({ type: 'archive' });
    }, [dispatch]);

    return (
      <View style={theme.taskListBar}>
        <View style={theme.buttons}>
          <TaskListBarButton
            title={intl.formatMessage(messages.archive)}
            disabled={!hasCompletedTask}
            type="gray"
            onPress={handleArchivePress}
          />
          <Link
            style={[theme.buttonGray, theme.buttonSmall, theme.buttonDisabled]}
            href="/me"
          >
            {intl.formatMessage(messages.archived)}
          </Link>
        </View>
      </View>
    );
  },
);

export default TaskListBar;
