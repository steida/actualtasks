import React, { useState, FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import validateTaskList from '@app/validators/validateTaskList';
import useAppContext from '@app/hooks/useAppContext';
import usePageTitles from '@app/hooks/usePageTitles';
import useScreenSize from '@app/hooks/useScreenSize';
import { hasValidationError } from '@app/components/ValidationError';
import TextInputWithLabelAndError from '@app/components/TextInputWithLabelAndError';
import FormButton from '@app/components/FormButton';
import Layout from '@app/components/Layout';
import useAppHref from '@app/hooks/useAppHref';
import { createTaskList } from '@app/clientstate/helpers';
import useClientState from '@app/clientstate/useClientState';

const Form: FunctionComponent = () => {
  const { theme } = useAppContext();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validateTaskList>>({
    name: null,
  });
  const appHref = useAppHref();
  const clientState = useClientState();

  const handleSubmitEditing = async () => {
    const taskList = await createTaskList(name);
    const errors = validateTaskList(taskList);
    if (hasValidationError(errors)) {
      setErrors(errors);
      return;
    }
    await clientState.saveTaskList(taskList);
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
