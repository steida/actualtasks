import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import createTaskList from '@app/state/createTaskList';
import validateTaskList from '@app/validators/validateTaskList';
import Button from '../components/Button';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
// import useAppState from '../hooks/useAppState';
import { pageTitles } from './_app';
import ValidationError from '../components/ValidationError';

const NameInput: React.FunctionComponent = () => {
  const { theme } = useAppContext();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<ReturnType<typeof validateTaskList>>({
    name: null,
  });
  // const setAppState = useSetAppState()
  const handleSubmitEditing = () => {
    const taskList = createTaskList(name);
    const errors = validateTaskList(taskList);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    // jak to promitnout? return type of validateTask? proc ne!
    // eslint-disable-next-line no-console
    console.log(errors);

    // eslint-disable-next-line no-console
    console.log(taskList.id);
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
      <View style={[theme.buttons, theme.marginTop]}>
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
