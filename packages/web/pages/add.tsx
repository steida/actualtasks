import React, { useState, FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import createTaskList from '@app/state/createTaskList';
import validateTaskList from '@app/validators/validateTaskList';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import usePageTitles from '@app/hooks/usePageTitles';
import useScreenSize from '@app/hooks/useScreenSize';
import { hasValidationError } from '@app/components/ValidationError';
import TextInputWithLabelAndError from '@app/components/TextInputWithLabelAndError';
import FormButton from '@app/components/FormButton';
import Layout from '@app/components/Layout';
import useAppHref from '@app/hooks/useAppHref';

const Form: FunctionComponent = () => {
  const { theme } = useAppContext();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validateTaskList>>({
    name: null,
  });
  const setAppState = useAppState();
  const appHref = useAppHref();

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
    appHref.push({
      pathname: '/',
      query: { id: taskList.id },
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
        error={errors.name}
        onSubmitEditing={handleSubmitEditing}
        maxLength="short"
      />
      <View style={theme.buttons}>
        <FormButton title="add" onPress={handleSubmitEditing} />
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
