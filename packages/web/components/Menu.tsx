import React, { FunctionComponent } from 'react';
import { Text, View } from 'react-native';
import { rootTaskListId } from '@app/state/appStateConfig';
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
  accessible: boolean;
  taskListId: string;
  taskListName: string;
}

const TaskListLink: FunctionComponent<TaskListLinkProps> = React.memo(
  ({ accessible, taskListId, taskListName }) => {
    const { theme, router } = useAppContext();
    const isRoot = taskListId === rootTaskListId;
    const indexHref: AppHref = {
      pathname: '/',
      query: isRoot ? null : { id: taskListId },
    };
    const editHref: AppHref = {
      pathname: '/edit',
      query: { id: taskListId },
    };
    const indexRouteIsActive = useRouteIsActive(indexHref);
    const editRouteIsActive = useRouteIsActive(editHref);
    const isIndexPage = router.pathname === indexHref.pathname;
    const routeIsActive = isIndexPage ? indexRouteIsActive : editRouteIsActive;

    return (
      <View style={theme.flexRow}>
        <MenuLink
          accessible={accessible || indexRouteIsActive || editRouteIsActive}
          style={!routeIsActive && theme.flex1}
          href={indexHref}
        >
          {taskListName}
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
  },
);

const TaskLists: FunctionComponent = () => {
  const taskLists = useAppState(state => state.taskLists);
  return (
    <>
      {taskLists.map((taskList, index) => (
        <TaskListLink
          // At least one link must be accessible.
          accessible={index === 0}
          taskListId={taskList.id}
          taskListName={taskList.name}
          key={taskList.id}
        />
      ))}
    </>
  );
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
