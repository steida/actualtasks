import React, { useState, FunctionComponent } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import isEmail from 'validator/lib/isEmail';
import Button from '../components/Button';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import Link from '../components/Link';
import usePageTitles from '../hooks/usePageTitles';

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

const Footer: FunctionComponent = () => {
  const { theme } = useAppContext();
  return (
    <View style={theme.layoutFooter}>
      <Text style={theme.textSmall}>
        <Link href="https://github.com/steida/actualtasks">
          <FormattedMessage defaultMessage="made" id="madeBy" />
        </Link>
        {' by '}
        <Link href="https://twitter.com/steida">steida</Link> for {''}
        <Link href="https://blockstream.info/address/13fJfcXAZncP1NnMNtpG1KxEYL514jtUy3">
          satoshis
        </Link>
      </Text>
    </View>
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
      <Footer />
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
