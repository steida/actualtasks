import React, { FunctionComponent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, View } from 'react-native';
import validateTaskList from '@app/validators/validateTaskList';
import Router from 'next/router';
import { rootTaskListId } from '@app/state/appStateConfig';
import { TaskList } from '@app/state/types';
import Layout from '../components/Layout';
import usePageTitles from '../hooks/usePageTitles';
import useAppStateTaskListByRouter from '../hooks/useAppStateTaskListByRouter';
import useTaskListTitle from '../hooks/useTaskListTitle';
import TextInputWithLabelAndError from '../components/TextInputWithLabelAndError';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import FormButton from '../components/FormButton';
import { hasValidationError } from '../components/ValidationError';
import { AppHref } from '../types';
import useScreenSize from '../hooks/useScreenSize';

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
    const href: AppHref = {
      pathname: '/',
      query: { id: taskList.id },
    };
    Router.push(href);
  };

  const handleArchivePress = () => {
    setAppState(state => {
      const index = state.taskLists.findIndex(t => t.id === taskList.id);
      state.taskLists.splice(index, 1);
      state.archivedTaskLists.push(taskList);
    });
    const href: AppHref = {
      pathname: '/',
    };
    Router.push(href);
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
        <FormButton label="save" onPress={handleSavePress} />
        {!isRootTaskList && (
          <FormButton label="archive" onPress={handleArchivePress} />
        )}
      </View>
    </>
  );
};

const Edit: FunctionComponent = () => {
  const { theme } = useAppContext();
  const pageTitles = usePageTitles();
  const taskList = useAppStateTaskListByRouter();
  const title = useTaskListTitle(taskList, true);

  if (taskList == null)
    return (
      <Layout title={title}>
        <Text style={theme.text}>{title}</Text>
      </Layout>
    );

  return (
    <Layout title={pageTitles.edit(title)}>
      <Form taskList={taskList} key={taskList.id} />
    </Layout>
  );
};

export default Edit;
