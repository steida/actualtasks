import React, { FunctionComponent } from 'react';
import { WithRouterProps } from 'next/router';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';
// import useAppState from '../hooks/useAppState';

const Index: FunctionComponent<WithRouterProps> = () => {
  const { intl } = useAppContext();
  // const viewer = useAppState(state => state.viewer);
  // // eslint-disable-next-line no-console
  // console.log(viewer);

  const title = intl.formatMessage(pageTitles.index);
  return <Layout title={title}>{/* <Tasks /> */}</Layout>;
};

export default Index;

// const Index: FunctionComponent<WithRouterProps> = () => {
//   const { intl } = useAppContext();
//   // const taskListId = router && router.query && router.query.id;
//   // const taskList = useAppState(state =>
//   //   state.taskLists.find(taskList => taskList.id === taskListId),
//   // );
//   // eslint-disable-next-line no-console
//   // console.log(taskList && taskList.name);

//   const title = intl.formatMessage(pageTitles.index);

//   return <Layout title={title}>{/* <Tasks /> */}</Layout>;
// };

// export default withRouter(Index);
