import React from 'react';
import { Text } from 'react-native';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';

const Index: React.FunctionComponent = () => {
  const { appState, intl, setAppState } = useAppContext();
  const title = intl.formatMessage(pageTitles.index);

  const onPress = () => {
    setAppState(state => {
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    });
  };

  return (
    <Layout title={title}>
      <Text>{appState.darkMode.toString()}</Text>
      <Text onPress={onPress}>Soon 🎯</Text>
    </Layout>
  );
};

export default Index;
