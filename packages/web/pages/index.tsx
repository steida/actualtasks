import React from 'react';
import Layout from '../components/Layout';
import Todos from '../components/Todos';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';

const Index: React.FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.index);

  return (
    <Layout title={title}>
      <Todos />
    </Layout>
  );
};

export default Index;
