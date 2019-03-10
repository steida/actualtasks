import React, { useState, FunctionComponent } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import isEmail from 'validator/lib/isEmail';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import usePageTitles from '@app/hooks/usePageTitles';
import Button from '../components/Button';
import Layout from '../components/Layout';

export const messages = defineMessages({
  backupAndSync: {
    defaultMessage: 'Backup and Sync',
    id: 'backupAndSync',
  },
});

const DarkModeButton: FunctionComponent = () => {
  const darkMode = useAppState(state => state.viewer.darkMode);
  const setAppState = useAppState();
  const emoji = darkMode ? '🌛' : '🌤';
  const toggleViewerDarkMode = () => {
    setAppState(({ viewer }) => {
      viewer.darkMode = !viewer.darkMode;
    });
  };
  return (
    <Button size="big" onPress={toggleViewerDarkMode}>
      {emoji}
    </Button>
  );
};

const EmailInput: FunctionComponent = () => {
  const { theme } = useAppContext();
  const email = useAppState(state => state.viewer.email);
  const setAppState = useAppState();
  const setViewerEmail = (email: string) =>
    setAppState(({ viewer }) => {
      viewer.email = email;
    });
  const labelIsValid = email === '' || isEmail(email);

  return (
    <>
      <Text style={[theme.label, !labelIsValid && theme.labelInvalid]}>
        <FormattedMessage defaultMessage="Email" id="emailLabel" />
      </Text>
      <TextInput
        keyboardType="email-address"
        onChangeText={text => setViewerEmail(text)}
        style={theme.textInputOutline}
        value={email}
      />
    </>
  );
};

const Form = () => {
  const { intl, theme } = useAppContext();
  const [backupAndSyncShown, setBackupAndSyncShown] = useState(false);

  return (
    <>
      <View style={theme.buttons}>
        <DarkModeButton />
      </View>
      <View style={theme.buttons}>
        <Button onPress={() => setBackupAndSyncShown(!backupAndSyncShown)}>
          {intl.formatMessage(messages.backupAndSync)}
        </Button>
      </View>
      {backupAndSyncShown && (
        <View style={theme.marginTop}>
          <EmailInput />
          <Text style={[theme.text, theme.marginTop]}>
            <FormattedMessage
              defaultMessage="TODO: Explain we don't store nor use email etc."
              id="syncExplaining"
            />
          </Text>
          <View style={[theme.buttons, theme.marginTop]}>
            <Button disabled type="primary">
              {intl.formatMessage(messages.backupAndSync)}
            </Button>
          </View>
        </View>
      )}
    </>
  );
};

const Me: FunctionComponent = () => {
  const pageTitles = usePageTitles();

  return (
    <Layout title={pageTitles.me}>
      <Form />
    </Layout>
  );
};

export default Me;
