import React, { FunctionComponent, useCallback } from 'react';
import Layout from '@app/components/Layout';
import useAppHrefTaskListId from '@app/hooks/useAppHrefTaskListId';
import { TaskListWithData } from '@app/components/TaskList';
import { AppState } from '@app/state/types';
import useAppState from '@app/hooks/useAppState';
import usePageTitles from '@app/hooks/usePageTitles';
import { rootTaskListId } from '@app/state/appStateConfig';

const Index: FunctionComponent = () => {
  const taskListId = useAppHrefTaskListId();
  // Only the name. We don't want to rerender Layout on any change.
  const taskListName = useAppState(
    useCallback(
      ({ taskLists }: AppState) => {
        const taskList = taskLists.find(t => t.id === taskListId);
        return taskList != null ? taskList.name : null;
      },
      [taskListId],
    ),
  );
  const pageTitles = usePageTitles();
  const title =
    taskListName == null
      ? pageTitles.notFound
      : taskListId === rootTaskListId
      ? pageTitles.index
      : // Maybe: `${taskListName} - ${pageTitles.index}`;
        taskListName;

  // We don't subscribe data here, because it would rerender Layout.
  // It's TaskListWithData responsibility.
  return (
    <Layout title={title} noScrollView>
      {taskListId != null && (
        // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
        <TaskListWithData taskListId={taskListId} key={taskListId} />
      )}
    </Layout>
  );
};

export default Index;
