import React, { FunctionComponent, memo } from 'react';
import { Text, View } from 'react-native';
import { rootTaskListId } from '@app/state/appStateConfig';
import useAppContext from '@app/hooks/useAppContext';
// import useAppState from '@app/hooks/useAppState';
import useScreenSize from '@app/hooks/useScreenSize';
import useAppHref, { AppHref } from '@app/hooks/useAppHref';
import Link, { LinkProps } from './Link';
import KeyboardNavigableView from './KeyboardNavigableView';

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

// It's weird, but the first child is always updated for unknown reason.
// Maybe something React internal, maybe I overlooked something.
const TaskListLink: FunctionComponent<TaskListLinkProps> = memo(
  ({ accessible, taskListId, taskListName }) => {
    const { theme, router } = useAppContext();
    const isRoot = taskListId === rootTaskListId;
    const indexHref: AppHref = {
      pathname: '/',
      query: isRoot ? undefined : { id: taskListId },
    };
    const queryId = router.query && router.query.id;
    const routeIsActive = isRoot
      ? // Because of actualtasks.com or actualtasks.com/edit?id=
        queryId === undefined || queryId === rootTaskListId
      : queryId === taskListId;

    return (
      <View style={theme.flexRow}>
        <MenuLink
          accessible={accessible || routeIsActive}
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
            style={theme.flex1}
            href={{ pathname: '/edit', query: { id: taskListId } }}
          >
            <Text style={theme.noBold}>☰</Text>
          </MenuLink>
        )}
      </View>
    );
  },
);

const TaskLists: FunctionComponent = () => {
  // const taskLists = useAppState(state => state.taskLists);
  const taskLists = [{ id: '123', name: 'test' }];
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
  const appHref = useAppHref();
  const addIsActive = appHref.isActive({ pathname: '/add' });
  const archivedIsActive = appHref.isActive({ pathname: '/archived' });

  return (
    <KeyboardNavigableView
      style={[
        theme.negativeMarginHorizontal,
        screenSize.phoneOnly ? theme.flexRow : theme.flexColumn,
      ]}
    >
      <TaskLists />
      <View style={theme.flexRow}>
        <MenuLink accessible={addIsActive} href={{ pathname: '/add' }}>
          +
        </MenuLink>
        <MenuLink
          accessible={archivedIsActive}
          href={{ pathname: '/archived' }}
        >
          ∞
        </MenuLink>
      </View>
    </KeyboardNavigableView>
  );
};

export default Menu;
