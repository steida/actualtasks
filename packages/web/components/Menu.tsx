import React, { FunctionComponent } from 'react';
import { indexTaskListId } from '@app/state/appStateConfig';
import { View } from 'react-native';
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
  // ✎ for edit? menu for active tasklist?
  // const isActive = true;
  return (
    <>
      {taskLists
        .slice(0) // Because taskLists is immutable and sort mutates.
        .sort()
        .map(taskList => {
          return (
            <TaskListLink
              href={taskList.id === indexTaskListId ? '/' : '/me'}
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
