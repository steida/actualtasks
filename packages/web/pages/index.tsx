import React, { FunctionComponent } from 'react';
import { WithRouterProps, withRouter, DefaultQuery } from 'next/router';
import { rootTaskListId } from '@app/state/appStateConfig';
import { defineMessages } from 'react-intl';
import { Text } from 'react-native';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';
import useAppState from '../hooks/useAppState';

const messages = defineMessages({
  notFound: {
    defaultMessage: 'This task list does not exists.',
    id: 'taskListNotFound',
  },
});

interface IndexQuery extends DefaultQuery {
  id?: string;
}

const Index: FunctionComponent<WithRouterProps<IndexQuery>> = ({ router }) => {
  const { intl, theme } = useAppContext();
  // useAppState selector must be a pure function because it's memoized.
  const taskLists = useAppState(state => state.taskLists);
  const taskListId =
    (router && router.query && router.query.id) || rootTaskListId;
  // One weird trick, how to force null type. TypeScript otherwise always
  // returns TaskList. It should return TaskList | null imho.
  const taskList = taskLists[taskListId] != null ? taskLists[taskListId] : null;
  const title =
    taskList == null
      ? intl.formatMessage(messages.notFound)
      : taskList.id === rootTaskListId
      ? intl.formatMessage(pageTitles.index)
      : taskList.name;
  const content =
    taskList == null ? <Text style={theme.text}>{title}</Text> : null;
  return <Layout title={title}>{content}</Layout>;
};

export default withRouter(Index);
