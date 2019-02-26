import React, { FunctionComponent } from 'react';
import Layout from '../components/Layout';
import Tasks from '../components/Tasks';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';
// import Sidebar from '../components/Sidebar';

const Index: FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.index);

  return (
    <Layout title={title}>
      {/* <Sidebar /> */}
      <Tasks />
    </Layout>
  );
};

export default Index;
