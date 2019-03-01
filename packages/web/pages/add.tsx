import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import createTaskList from '@app/state/createTaskList';
import Button from '../components/Button';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
// import useAppState from '../hooks/useAppState';
import { pageTitles } from './_app';

const NameInput: React.FunctionComponent = () => {
  const { theme } = useAppContext();
  const [name, setName] = useState('');
  // const viewer = useAppState(state => state.viewer)
  // const setAppState = useAppState()
  // use setAppState? nebo optional?
  // const [appState, setAppState] = useAppState(state => state);
  // const setAppState = useSetAppState()
  const handleSubmitEditing = () => {
    // if (name.length < 1) return;
    const taskList = createTaskList();
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
