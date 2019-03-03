import React, { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, View } from 'react-native';
import validateTaskList from '@app/validators/validateTaskList';
import Router from 'next/router';
import { rootTaskListId } from '@app/state/appStateConfig';
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

const Edit: FunctionComponent = () => {
  const { theme } = useAppContext();
  const pageTitles = usePageTitles();
  const taskList = useAppStateTaskListByRouter();
  const title = useTaskListTitle(taskList, true);
  const setAppState = useAppState();

  if (taskList == null)
    return (
      <Layout title={title}>
        <Text style={theme.text}>{title}</Text>
      </Layout>
    );

  const handleNameChange = (name: string) => {
    setAppState(state => {
      state.taskLists[taskList.id].name = name;
    });
  };

  const handleArchivePress = () => {
    setAppState(state => {
      const archivedTaskList = state.taskLists[taskList.id];
      delete state.taskLists[taskList.id];
      state.archivedTaskLists[archivedTaskList.id] = archivedTaskList;
    });
    const href: AppHref = {
      pathname: '/',
    };
    Router.push(href);
  };

  const errors = validateTaskList(taskList);
  const isRootTaskList = taskList.id === rootTaskListId;

  return (
    <Layout title={pageTitles.edit(title)}>
      <TextInputWithLabelAndError
        label={<FormattedMessage defaultMessage="Name" id="taskNameLabel" />}
        value={taskList.name}
        onChangeText={handleNameChange}
        error={errors.name}
        maxLength="short"
      />
      <View style={theme.buttons}>
        {!isRootTaskList && (
          <FormButton
            disabled={hasValidationError(errors)}
            label="archive"
            onPress={handleArchivePress}
          />
        )}
      </View>
    </Layout>
  );
};

export default Edit;
