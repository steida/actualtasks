import React, { FunctionComponent } from 'react';
import { Text } from 'react-native';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import useAppStateTaskListByRouter from '../hooks/useAppStateTaskListByRouter';
import useTaskListTitle from '../hooks/useTaskListTitle';

const Index: FunctionComponent = () => {
  const { theme } = useAppContext();
  const taskList = useAppStateTaskListByRouter();
  const title = useTaskListTitle(taskList);
  const content =
    taskList == null ? <Text style={theme.text}>{title}</Text> : null;
  return <Layout title={title}>{content}</Layout>;
};

export default Index;
