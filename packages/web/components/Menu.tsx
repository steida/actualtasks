import React, { FunctionComponent, useMemo } from 'react';
import { View } from 'react-native';
import { rootTaskListId } from '@app/state/appStateConfig';
import useAppState from '../hooks/useAppState';
import useAppContext from '../hooks/useAppContext';
import Link, { LinkProps } from './Link';

const TaskListLink: FunctionComponent<LinkProps> = props => {
  const { theme } = useAppContext();
  return (
    <Link
      activeStyle={[theme.textSmall, theme.bold]}
      style={[theme.textSmallGray, theme.bold, theme.marginHorizontal]}
      href={props.href}
    >
      {props.children}
    </Link>
  );
};

const TaskLists: FunctionComponent = () => {
  const taskLists = useAppState(state => state.taskLists);
  const sortedTaskLists = useMemo(() => {
    return Object.values(taskLists).sort((a, b) => a.createdAt - b.createdAt);
  }, [taskLists]);

  // ✎ for edit? menu for active tasklist?
  // const isActive = true;
  return (
    <>
      {sortedTaskLists.map(taskList => {
        const isRoot = taskList.id === rootTaskListId;
        return (
          <TaskListLink
            href={{
              pathname: '/',
              query: isRoot ? null : { id: taskList.id },
            }}
            key={taskList.id}
          >
            {taskList.name}
          </TaskListLink>
        );
      })}
    </>
  );
};

interface MenuProps {
  isSmallScreen: boolean;
}

const Menu: FunctionComponent<MenuProps> = props => {
  const { theme } = useAppContext();

  return (
    <View
      style={[
        theme.negativeMarginHorizontal,
        props.isSmallScreen ? theme.flexRow : theme.flexColumn,
      ]}
    >
      <TaskLists />
      <TaskListLink href="/add">+</TaskListLink>
    </View>
  );
};

export default Menu;
