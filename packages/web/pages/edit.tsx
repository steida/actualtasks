import React, { FunctionComponent, useState, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import validateTaskList from '@app/validators/validateTaskList';
import { rootTaskListId } from '@app/state/appStateConfig';
import { TaskList, AppState } from '@app/state/types';
import useAppContext from '@app/hooks/useAppContext';
import usePageTitles from '@app/hooks/usePageTitles';
import useAppState from '@app/hooks/useAppState';
import useAppHref from '@app/hooks/useAppHref';
import useScreenSize from '@app/hooks/useScreenSize';
import FormButton from '@app/components/FormButton';
import { hasValidationError } from '@app/components/ValidationError';
import TextInputWithLabelAndError from '@app/components/TextInputWithLabelAndError';
import Layout from '@app/components/Layout';
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
  const setAppState = useAppState();
  const appHref = useAppHref();

  const handleSavePress = () => {
    const newTaskList = { ...taskList, name };
    const errors = validateTaskList(newTaskList);
    if (hasValidationError(errors)) {
      setErrors(errors);
      return;
    }
    setAppState(state => {
      const index = state.taskLists.findIndex(t => t.id === taskList.id);
      state.taskLists[index].name = name;
    });
    appHref.push({
      pathname: '/',
      query: { id: taskList.id },
    });
  };

  const handleArchivePress = () => {
    setAppState(({ taskLists, archivedTaskLists }) => {
      const index = taskLists.findIndex(t => t.id === taskList.id);
      if (index === -1) return;
      const archivedTaskList = taskLists[index];
      taskLists.splice(index, 1);
      archivedTaskList.archivedAt = Date.now();
      archivedTaskLists.push(archivedTaskList);
    });
    appHref.push({
      pathname: '/',
    });
  };

  const isRootTaskList = taskList.id === rootTaskListId;
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
        {!isRootTaskList && (
          <FormButton title="archive" onPress={handleArchivePress} />
        )}
      </View>
    </>
  );
};

const Edit: FunctionComponent = () => {
  const pageTitles = usePageTitles();
  const query = useAppHref().query('/edit');
  const taskList = useAppState(
    useCallback(
      ({ taskLists }: AppState) =>
        taskLists.find(t => t.id === (query && query.id)),
      [query],
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
