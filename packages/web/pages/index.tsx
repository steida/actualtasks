import React, { FunctionComponent } from 'react';
import Layout from '@app/components/Layout';
// import { TaskListWithData } from '@app/components/TaskList';
// import TaskListArchived from '@app/components/TaskListArchived';
// import { AppState } from '@app/state/types';
// import useAppState from '@app/hooks/useAppState';
// import usePageTitles from '@app/hooks/usePageTitles';
// import { rootTaskListId } from '@app/state/appStateConfig';
import { FormattedMessage } from 'react-intl';
import { Text } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import useAppHref from '@app/hooks/useAppHref';
import Error from 'next/error';

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
  const query = useAppHref().query('/');
  // const queryId = query ? query.id || rootTaskListId : null;
  // Only the name. We don't want to rerender Layout on any change.
  // const taskListName = useAppState(
  //   useCallback(
  //     ({ taskLists }: AppState) => {
  //       const taskList = taskLists.find(t => t.id === queryId);
  //       return taskList != null ? taskList.name : null;
  //     },
  //     [queryId],
  //   ),
  // );
  // const pageTitles = usePageTitles();

  if (query == null) return <Error statusCode={404} />;

  // const title =
  //   taskListName == null
  //     ? pageTitles.notFound
  //     : queryId === rootTaskListId
  //     ? pageTitles.index
  //     : // Maybe: `${taskListName} - ${pageTitles.index}`;
  //       taskListName;

  // Note key used to reset component state.
  // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
  return (
    <Layout title="title" noScrollView>
      {/* {taskListName != null && queryId != null ? (
        query.view === 'archived' ? (
          <TaskListArchived taskListId={queryId} key={queryId} />
        ) : (
          <TaskListWithData taskListId={queryId} key={queryId} />
        )
      ) : ( */}
      <TaskListDoesNotExist />
      {/* )} */}
    </Layout>
  );
};

export default Index;
