import React, { FunctionComponent } from 'react';
import { indexTaskListId } from '@app/state/appStateConfig';
import useAppState from '../hooks/useAppState';
import useAppContext from '../hooks/useAppContext';
import Link, { LinkProps } from './Link';

const TaskListLink: FunctionComponent<LinkProps> = props => {
  const { theme } = useAppContext();
  return (
    <Link
      activeStyle={theme.textSmall}
      style={theme.textSmallGray}
      href={props.href}
    >
      {props.children}
    </Link>
  );
};

const TaskLists: FunctionComponent = () => {
  const [taskLists] = useAppState(state => state.taskLists);
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

const Menu: FunctionComponent = () => {
  return (
    <>
      <TaskLists />
      <TaskListLink href="/add">+</TaskListLink>
    </>
  );
};

export default Menu;
