import React, { FunctionComponent, useMemo } from 'react';
import { View } from 'react-native';
import { rootTaskListId } from '@app/state/appStateConfig';
import useAppState from '../hooks/useAppState';
import useAppContext from '../hooks/useAppContext';
import Link, { LinkProps } from './Link';
import useRouteIsActive from '../hooks/useRouteIsActive';
import { AppHref } from '../types';

const MenuLink: FunctionComponent<LinkProps> = props => {
  const { theme } = useAppContext();
  return (
    <Link
      activeStyle={[theme.textSmall, theme.bold]}
      style={[theme.textSmallGray, theme.bold, theme.paddingHorizontal]}
      {...props}
    />
  );
};

interface TaskListLinkProps {
  id: string;
}

const TaskListLink: FunctionComponent<TaskListLinkProps> = props => {
  const { theme, router } = useAppContext();
  const isRoot = props.id === rootTaskListId;
  const indexHref: AppHref = {
    pathname: '/',
    query: isRoot ? null : { id: props.id },
  };
  const editHref: AppHref = {
    pathname: '/edit',
    query: { id: props.id },
  };
  const isIndexPage = router.pathname === indexHref.pathname;
  const routeIsActive = useRouteIsActive(isIndexPage ? indexHref : editHref);
  return (
    <View style={theme.flexRow}>
      <MenuLink href={indexHref}>{props.children}</MenuLink>
      {routeIsActive && <MenuLink href={editHref}>☰</MenuLink>}
    </View>
  );
};

const TaskLists: FunctionComponent = () => {
  const taskLists = useAppState(state => state.taskLists);
  const sortedTaskLists = useMemo(() => {
    return Object.values(taskLists).sort((a, b) => a.createdAt - b.createdAt);
  }, [taskLists]);

  return (
    <>
      {sortedTaskLists.map(taskList => {
        return (
          <TaskListLink id={taskList.id} key={taskList.id}>
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
      <MenuLink href="/add">+</MenuLink>
    </View>
  );
};

export default Menu;
