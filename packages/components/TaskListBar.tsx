import React, { FunctionComponent, Dispatch, memo, useCallback } from 'react';
import { View } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import { defineMessages } from 'react-intl';
import useAppHref from '@app/hooks/useAppHref';
import Button, { ButtonProps } from './Button';
import Link, { LinkProps } from './Link';
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

const TaskListBarLink: FunctionComponent<LinkProps> = ({
  children,
  ...rest
}) => {
  const { theme } = useAppContext();
  return (
    <Link
      activeStyle={theme.taskListBarLinkActive}
      style={theme.taskListBarLink}
      {...rest}
    >
      {children}
    </Link>
  );
};

interface TaskListBarProps {
  hasCompletedTask: boolean;
  dispatch: Dispatch<Action>;
}

const TaskListBar: FunctionComponent<TaskListBarProps> = memo(
  ({ hasCompletedTask, dispatch }) => {
    const { theme, intl } = useAppContext();
    const query = useAppHref().query('/');
    const queryId = query && query.id;

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
          <TaskListBarLink
            href={{
              pathname: '/',
              query: queryId
                ? {
                    id: queryId,
                    view: 'archived',
                  }
                : { view: 'archived' },
            }}
          >
            {intl.formatMessage(messages.archived)}
          </TaskListBarLink>
        </View>
      </View>
    );
  },
);

export default TaskListBar;
