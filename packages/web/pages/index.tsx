import React, { FunctionComponent, useCallback } from 'react';
import Layout from '@app/components/Layout';
import { TaskListWithData } from '@app/components/TaskList';
import { AppState } from '@app/state/types';
import useAppState from '@app/hooks/useAppState';
import usePageTitles from '@app/hooks/usePageTitles';
import { rootTaskListId } from '@app/state/appStateConfig';
import { FormattedMessage } from 'react-intl';
import { Text } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import useAppHref from '@app/hooks/useAppHref';

export const TaskListDoesNotExist: FunctionComponent = () => {
  const { theme } = useAppContext();
  return (
    <Text style={theme.text}>
      <FormattedMessage
        defaultMessage="Task list does not exist."
        id="taskList.notFound"
      />
    </Text>
  );
};

const Index: FunctionComponent = () => {
  const query = useAppHref().parsed['/'];
  const queryIdOrDefault = query.id || rootTaskListId;
  // Only the name. We don't want to rerender Layout on any change.
  const taskListName = useAppState(
    useCallback(
      ({ taskLists }: AppState) => {
        const taskList = taskLists.find(t => t.id === queryIdOrDefault);
        return taskList != null ? taskList.name : null;
      },
      [queryIdOrDefault],
    ),
  );
  const pageTitles = usePageTitles();
  const title =
    taskListName == null
      ? pageTitles.notFound
      : queryIdOrDefault === rootTaskListId
      ? pageTitles.index
      : // Maybe: `${taskListName} - ${pageTitles.index}`;
        taskListName;

  return (
    <Layout title={title} noScrollView>
      {taskListName != null ? (
        // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
        <TaskListWithData
          taskListId={queryIdOrDefault}
          key={queryIdOrDefault}
        />
      ) : (
        <TaskListDoesNotExist />
      )}
    </Layout>
  );
};

export default Index;
