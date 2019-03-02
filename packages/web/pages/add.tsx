import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import createTaskList from '@app/state/createTaskList';
import validateTaskList from '@app/validators/validateTaskList';
import Button from '../components/Button';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import { pageTitles } from './_app';
import ValidationError, {
  hasValidationError,
} from '../components/ValidationError';

// TODO: This will be reusable field component within reusable form.
const NameInput: React.FunctionComponent = () => {
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
    // TODO: Redirect.
  };

  return (
    <>
      <Text style={theme.label}>
        <FormattedMessage defaultMessage="Name" id="nameLabel" />
      </Text>
      <TextInput
        onChangeText={text => setName(text)}
        style={theme.textInputOutline}
        enablesReturnKeyAutomatically
        blurOnSubmit={false}
        onSubmitEditing={handleSubmitEditing}
        value={name}
        maxLength={32}
      />
      <ValidationError error={errors.name} />
      <View style={theme.buttons}>
        <Button onPress={handleSubmitEditing} size="small" type="primary">
          <FormattedMessage defaultMessage="Add" id="add" />
        </Button>
      </View>
    </>
  );
};

const Add: React.FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.add);

  return (
    <Layout title={title}>
      <NameInput />
    </Layout>
  );
};

export default Add;
