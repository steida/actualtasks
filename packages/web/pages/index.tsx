import React from 'react';
import { Text } from 'react-native';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';

const Index: React.FunctionComponent = () => {
  const { intl, theme } = useAppContext();
  const title = intl.formatMessage(pageTitles.index);

  return (
    <Layout title={title}>
      <Text style={theme.text}>Soon 🎯</Text>
    </Layout>
  );
};

export default Index;
