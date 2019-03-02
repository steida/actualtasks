import React, { useState, FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import createTaskList from '@app/state/createTaskList';
import validateTaskList from '@app/validators/validateTaskList';
import Router from 'next/router';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import { pageTitles } from './_app';
import { hasValidationError } from '../components/ValidationError';
import { AppHref } from '../types';
import TextInputWithLabelAndError from '../components/TextInputWithLabelAndError';
import FormButton from '../components/FormButton';

const Add: FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.add);

  const { theme } = useAppContext();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validateTaskList>>({
    name: null,
  });
  const setAppState = useAppState();

  const handleSubmitEditing = () => {
    const taskList = createTaskList(name);
    const errors = validateTaskList(taskList);
    if (hasValidationError(errors)) {
      setErrors(errors);
      return;
    }
    setAppState(state => {
      state.taskLists[taskList.id] = taskList;
    });
    const href: AppHref = {
      pathname: '/',
      query: { id: taskList.id },
    };
    Router.push(href);
  };

  return (
    <Layout title={title}>
      <TextInputWithLabelAndError
        label={<FormattedMessage defaultMessage="Name" id="taskNameLabel" />}
        value={name}
        onChangeText={text => setName(text)}
        error={errors.name}
        onSubmitEditing={handleSubmitEditing}
        maxLength="short"
      />
      <View style={theme.buttons}>
        <FormButton label="add" onPress={handleSubmitEditing} />
      </View>
    </Layout>
  );
};

export default Add;
