import React, { FunctionComponent } from 'react';
import Layout from '../components/Layout';
import Tasks from '../components/Tasks';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';

const Index: FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.index);

  return (
    <Layout title={title} noFooter>
      <Tasks />
    </Layout>
  );
};

export default Index;
