import React, {
  FunctionComponent,
  useState,
  useCallback,
  memo,
  useMemo,
} from 'react';
import usePageTitles from '@app/hooks/usePageTitles';
import { Text, View } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import FormButton from '@app/components/FormButton';
import { TaskList } from '@app/clientstate/types';
import Button from '@app/components/Button';
import { FormattedRelative, FormattedMessage } from 'react-intl';
import Layout from '@app/components/Layout';
import useClientState from '@app/clientstate/useClientState';
import { getSortedArchivedTaskLists } from '@app/clientstate/helpers';

interface ArchivedTaskListProps {
  taskList: TaskList;
}

const ArchivedTaskList: FunctionComponent<ArchivedTaskListProps> = memo(
  ({ taskList }) => {
    const [expanded, setExpanded] = useState(false);
    const { theme } = useAppContext();
    const clientState = useClientState();

    const handleTogglePress = useCallback(() => {
      setExpanded(!expanded);
    }, [expanded]);

    const handleUnarchivePress = () => {
      clientState.saveTaskList({ ...taskList, archivedAt: undefined });
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
            </View>
          </>
        )}
      </View>
    );
  },
);

const ArchivedTaskLists: FunctionComponent = () => {
  const { theme } = useAppContext();
  const taskLists = useClientState(useCallback(state => state.taskLists, []));
  const archivedTaskLists: TaskList[] = useMemo(
    () => getSortedArchivedTaskLists(taskLists).reverse(),
    [taskLists],
  );

  if (archivedTaskLists.length === 0)
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
      {archivedTaskLists.map(taskList => (
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
