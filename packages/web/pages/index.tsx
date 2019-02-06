import React from 'react';
import { Text } from 'react-native';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';

const Index: React.FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.index);
  const a: 1 = 2;

  return (
    <Layout title={title}>
      <Text>Soon 🎯</Text>
    </Layout>
  );
};

export default Index;
