import React, {
  FunctionComponent,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import validateTaskList from '@app/validators/validateTaskList';
import { TaskList } from '@app/clientstate/types';
import useAppContext from '@app/hooks/useAppContext';
import usePageTitles from '@app/hooks/usePageTitles';
import useAppHref from '@app/hooks/useAppHref';
import useScreenSize from '@app/hooks/useScreenSize';
import FormButton from '@app/components/FormButton';
import { hasValidationError } from '@app/components/ValidationError';
import TextInputWithLabelAndError from '@app/components/TextInputWithLabelAndError';
import Layout from '@app/components/Layout';
import useClientState from '@app/clientstate/useClientState';
import { getSortedNotArchivedTaskLists } from '@app/clientstate/helpers';
import { TaskListDoesNotExist } from './index';

interface FormProps {
  taskList: TaskList;
}

const Form: FunctionComponent<FormProps> = ({ taskList }) => {
  const { theme } = useAppContext();
  const [name, setName] = useState(taskList.name);
  const [errors, setErrors] = useState<ReturnType<typeof validateTaskList>>({
    name: null,
  });
  const taskLists = useClientState(useCallback(state => state.taskLists, []));
  const sortedNotArchivedTaskLists: TaskList[] = useMemo(
    () => getSortedNotArchivedTaskLists(taskLists),
    [taskLists],
  );
  const appHref = useAppHref();
  const clientState = useClientState();

  const canArchive = sortedNotArchivedTaskLists.length > 1;

  const saveTaskList = async (taskList: TaskList) => {
    const errors = validateTaskList(taskList);
    if (hasValidationError(errors)) {
      setErrors(errors);
      return;
    }
    await clientState.saveTaskList(taskList);
  };

  const handleSavePress = async () => {
    const taskListToSave = { ...taskList, name };
    await saveTaskList(taskListToSave);
    appHref.push({
      pathname: '/',
      query: { id: taskList.id },
    });
  };

  const handleArchivePress = async () => {
    const taskListToSave = { ...taskList, archivedAt: Date.now() };
    await saveTaskList(taskListToSave);
    appHref.push({
      pathname: '/',
    });
  };

  const screenSize = useScreenSize();

  return (
    <>
      <TextInputWithLabelAndError
        autoFocus={!screenSize.phoneOnly}
        label={<FormattedMessage defaultMessage="Name" id="taskNameLabel" />}
        value={name}
        onChangeText={text => setName(text)}
        onSubmitEditing={handleSavePress}
        error={errors.name}
        maxLength="short"
      />
      <View style={theme.buttons}>
        <FormButton title="save" onPress={handleSavePress} />
        {canArchive && (
          <FormButton title="archive" onPress={handleArchivePress} />
        )}
      </View>
    </>
  );
};

const Edit: FunctionComponent = () => {
  const pageTitles = usePageTitles();
  const query = useAppHref().query('/edit');
  const queryTaskListId = query ? query.id : null;
  const taskList = useClientState(
    useCallback(
      state => (queryTaskListId ? state.taskLists[queryTaskListId] : null),
      [queryTaskListId],
    ),
  );

  const title = taskList ? pageTitles.edit(taskList.name) : pageTitles.notFound;

  return (
    <Layout title={title}>
      {taskList == null ? (
        <TaskListDoesNotExist />
      ) : (
        <Form taskList={taskList} key={taskList.id} />
      )}
    </Layout>
  );
};

export default Edit;
