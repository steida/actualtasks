import React, { FunctionComponent } from 'react';
import { Text, View } from 'react-native';
import { rootTaskListId } from '@app/state/appStateConfig';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import useScreenSize from '@app/hooks/useScreenSize';
import Link, { LinkProps } from './Link';
import useRouteIsActive from '../web/hooks/useRouteIsActive';
import { AppHref } from '../web/types';
import KeyboardNavigableView from '../web/components/KeyboardNavigableView';

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
          // We use it for manual focus from TaskList onEsc.
          nativeID={`menuTaskListLink${taskListId}`}
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
  const addHref = '/add';
  const archivedHref = '/archived';
  const addIsActive = useRouteIsActive(addHref);
  const archivedIsActive = useRouteIsActive(archivedHref);

  return (
    <KeyboardNavigableView
      style={[
        theme.negativeMarginHorizontal,
        screenSize.phoneOnly ? theme.flexRow : theme.flexColumn,
      ]}
    >
      <TaskLists />
      <View style={theme.flexRow}>
        <MenuLink accessible={addIsActive} href={addHref}>
          +
        </MenuLink>
        <MenuLink accessible={archivedIsActive} href={archivedHref}>
          ∞
        </MenuLink>
      </View>
    </KeyboardNavigableView>
  );
};

export default Menu;
