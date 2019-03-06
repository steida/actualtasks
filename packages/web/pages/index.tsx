import React, { FunctionComponent } from 'react';
import { Text } from 'react-native';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import useAppStateTaskListByRouter from '../hooks/useAppStateTaskListByRouter';
import useTaskListTitle from '../hooks/useTaskListTitle';
import TaskList from '../components/TaskList';

const Index: FunctionComponent = () => {
  const { theme } = useAppContext();
  const taskList = useAppStateTaskListByRouter();
  const title = useTaskListTitle(taskList);
  if (taskList == null)
    return (
      <Layout title={title}>
        <Text style={theme.text}>{title}</Text>
      </Layout>
    );

  return (
    <Layout title={title}>
      {/* https://twitter.com/estejs/status/1102238792382062593 */}
      <TaskList taskList={taskList} key={taskList.id} />
    </Layout>
  );
};

export default Index;
