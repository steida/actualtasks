import React, { FunctionComponent, memo } from 'react';
import { Text } from 'react-native';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import useAppStateTaskListByRouter from '../hooks/useAppStateTaskListByRouter';
import useTaskListTitle from '../hooks/useTaskListTitle';
import TaskList from '../components/TaskList';

interface LayoutWithTaskListProps {
  id: string;
  title: string;
}

// Micro-optimization exercise. Not ideal, TaskLists in Menu is still
// rendered on any taskList change. But that's fine.
const LayoutWithTaskList: FunctionComponent<LayoutWithTaskListProps> = memo(
  ({ id, title }) => {
    return (
      <Layout title={title}>
        {/* 
        Reset TaskList via key prop. Not only because of the state, but also
        because Slate and contentEditable are very complex.
        https://twitter.com/estejs/status/1102238792382062593
      */}
        <TaskList id={id} key={id} />
      </Layout>
    );
  },
);

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

  return <LayoutWithTaskList id={taskList.id} title={title} />;
};

export default Index;
