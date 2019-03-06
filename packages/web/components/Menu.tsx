import React, { FunctionComponent, useMemo } from 'react';
import { Text, View } from 'react-native';
import { rootTaskListId } from '@app/state/appStateConfig';
import { TaskList } from '@app/state/types';
import useAppState from '../hooks/useAppState';
import useAppContext from '../hooks/useAppContext';
import Link, { LinkProps } from './Link';
import useRouteIsActive from '../hooks/useRouteIsActive';
import { AppHref } from '../types';
import KeyboardNavigableView from './KeyboardNavigableView';
import useScreenSize from '../hooks/useScreenSize';

const MenuLink: FunctionComponent<LinkProps> = ({ style, ...rest }) => {
  const { theme } = useAppContext();
  return (
    <Link
      prefetch
      activeStyle={[theme.textSmall, theme.bold]}
      style={[theme.textSmallGray, theme.bold, theme.paddingHorizontal, style]}
      {...rest}
    />
  );
};

interface TaskListLinkProps {
  taskList: TaskList;
}

const TaskListLink: FunctionComponent<TaskListLinkProps> = ({ taskList }) => {
  const { theme, router } = useAppContext();
  const isRoot = taskList.id === rootTaskListId;
  const indexHref: AppHref = {
    pathname: '/',
    query: isRoot ? null : { id: taskList.id },
  };
  const editHref: AppHref = {
    pathname: '/edit',
    query: { id: taskList.id },
  };
  const indexRouteIsActive = useRouteIsActive(indexHref);
  const editRouteIsActive = useRouteIsActive(editHref);
  const isIndexPage = router.pathname === indexHref.pathname;
  const routeIsActive = isIndexPage ? indexRouteIsActive : editRouteIsActive;
  const accessible = indexRouteIsActive || editRouteIsActive;

  return (
    <View style={theme.flexRow}>
      <MenuLink
        accessible={accessible}
        style={!routeIsActive && theme.flex1}
        href={indexHref}
      >
        {taskList.name}
      </MenuLink>
      {routeIsActive && (
        <MenuLink
          accessible={false}
          style={routeIsActive && theme.flex1}
          href={editHref}
        >
          <Text style={theme.noBold}>☰</Text>
        </MenuLink>
      )}
    </View>
  );
};

const TaskLists: FunctionComponent = () => {
  const taskLists = useAppState(state => state.taskLists);
  // TODO: Memoize subselect somehow.
  // https://github.com/facebook/react/issues/15011
  const sortedTaskLists = useMemo(() => {
    return taskLists.sort((a, b) => a.createdAt - b.createdAt);
  }, [taskLists]);

  const children = useMemo(() => {
    return (
      <>
        {sortedTaskLists.map(taskList => (
          <TaskListLink taskList={taskList} key={taskList.id} />
        ))}
      </>
    );
  }, [sortedTaskLists]);

  return children;
};

const Menu: FunctionComponent = () => {
  const { theme } = useAppContext();
  const screenSize = useScreenSize();
  const newHref = '/add';
  const newIsActive = useRouteIsActive(newHref);

  return (
    <KeyboardNavigableView
      style={[
        theme.negativeMarginHorizontal,
        screenSize.phoneOnly ? theme.flexRow : theme.flexColumn,
      ]}
    >
      <TaskLists />
      <MenuLink accessible={newIsActive} href={newHref}>
        +
      </MenuLink>
    </KeyboardNavigableView>
  );
};

export default Menu;
