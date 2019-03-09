import React, { useState, FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import createTaskList from '@app/state/createTaskList';
import validateTaskList from '@app/validators/validateTaskList';
import Router from 'next/router';
import useAppContext from '@app/hooks/useAppContext';
import Layout from '../components/Layout';
import useAppState from '../hooks/useAppState';
import { hasValidationError } from '../components/ValidationError';
import { AppHref } from '../types';
import TextInputWithLabelAndError from '../components/TextInputWithLabelAndError';
import FormButton from '../components/FormButton';
import usePageTitles from '../hooks/usePageTitles';
import useScreenSize from '../hooks/useScreenSize';

const Form: FunctionComponent = () => {
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
      state.taskLists.push(taskList);
    });
    const href: AppHref = {
      pathname: '/',
      query: { id: taskList.id },
    };
    Router.push(href);
  };

  const screenSize = useScreenSize();

  return (
    <>
      <TextInputWithLabelAndError
        autoFocus={!screenSize.phoneOnly}
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
    </>
  );
};

const Add: FunctionComponent = () => {
  const pageTitles = usePageTitles();
  return (
    <Layout title={pageTitles.add}>
      {/* Form, so the whole page will not be rerendered on any keypress. */}
      <Form />
    </Layout>
  );
};

export default Add;
