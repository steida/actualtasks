import React, { FunctionComponent } from 'react';
import { WithRouterProps, withRouter } from 'next/router';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';
import useAppState from '../hooks/useAppState';

const Index: FunctionComponent<WithRouterProps> = ({ router }) => {
  const { intl } = useAppContext();
  // TODO: For typed parsing, use gcanti/io-ts.
  const taskListId = router && router.query && router.query.id;
  // useAppState selector must be a pure function because it's memoized.
  const taskLists = useAppState(state => state.taskLists);
  // TODO: taskList should be maybe null. How?
  const taskList = taskLists[taskListId as string];
  const taskListName = taskList && taskList.name;

  const title = taskListName || intl.formatMessage(pageTitles.index);

  return <Layout title={title}>{/* <Tasks /> */}</Layout>;
};

export default withRouter(Index);
