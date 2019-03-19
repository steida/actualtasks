import React, { FunctionComponent, useState, useCallback, memo } from 'react';
import usePageTitles from '@app/hooks/usePageTitles';
import { Text, View } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import useConfirm from '@app/hooks/useConfirm';
import FormButton from '@app/components/FormButton';
import { TaskList } from '@app/state/types';
import Button from '@app/components/Button';
import { FormattedRelative, FormattedMessage } from 'react-intl';
import Layout from '@app/components/Layout';

interface ArchivedTaskListProps {
  taskList: TaskList;
}

const ArchivedTaskList: FunctionComponent<ArchivedTaskListProps> = memo(
  ({ taskList }) => {
    const [expanded, setExpanded] = useState(false);
    const { theme } = useAppContext();
    const setAppState = useAppState();
    const confirm = useConfirm();

    const handleTogglePress = useCallback(() => {
      setExpanded(!expanded);
    }, [expanded]);

    const handleDeleteForeverPress = useCallback(() => {
      if (!confirm()) return;
      setAppState(({ archivedTaskLists }) => {
        archivedTaskLists.splice(
          archivedTaskLists.findIndex(t => t.id === taskList.id),
          1,
        );
      });
    }, [confirm, setAppState, taskList.id]);

    const handleUnarchivePress = () => {
      setAppState(({ taskLists, archivedTaskLists }) => {
        const index = archivedTaskLists.findIndex(t => t.id === taskList.id);
        if (index === -1) return;
        const unarchiveTaskList = archivedTaskLists[index];
        delete unarchiveTaskList.archivedAt;
        taskLists.push(unarchiveTaskList);
        archivedTaskLists.splice(index, 1);
      });
    };

    return (
      <View>
        <View style={theme.buttons}>
          <Button type={expanded ? 'text' : 'gray'} onPress={handleTogglePress}>
            <Text style={expanded && theme.bold}>{taskList.name}</Text>
          </Button>
        </View>
        {expanded && (
          <>
            {taskList.archivedAt && (
              <Text style={theme.textSmallGray}>
                <FormattedRelative value={taskList.archivedAt} />
              </Text>
            )}
            <View style={theme.buttons}>
              <FormButton
                onPress={handleUnarchivePress}
                title="unarchive"
                type="text"
              />
              <FormButton
                onPress={handleDeleteForeverPress}
                title="deleteForever"
                type="text"
              />
            </View>
          </>
        )}
      </View>
    );
  },
);

const ArchivedTaskLists: FunctionComponent = () => {
  const { theme } = useAppContext();
  const archivedTaskLists = useAppState(state => state.archivedTaskLists);
  // We don't have to sort task lists by archivedAt because they already are.
  // But we want reversed order. Note we have to shallow clone the array via
  // slice because reverse (like sort) mutates array.
  const sorted = archivedTaskLists.slice(0).reverse();
  if (sorted.length === 0)
    return (
      <Text style={theme.text}>
        <FormattedMessage
          defaultMessage="No task list has been archived yet."
          id="archived.emptyList"
        />
      </Text>
    );
  return (
    <>
      {sorted.map(taskList => (
        <ArchivedTaskList taskList={taskList} key={taskList.id} />
      ))}
    </>
  );
};

const Archived: FunctionComponent = () => {
  const { theme } = useAppContext();
  const pageTitles = usePageTitles();

  return (
    <Layout title={pageTitles.archived}>
      <Text style={theme.heading1}>{pageTitles.archived.split(' ')[0]}</Text>
      <ArchivedTaskLists />
    </Layout>
  );
};

export default Archived;
