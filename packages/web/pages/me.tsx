import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import isEmail from 'validator/lib/isEmail';
import Button from '../components/Button';
import Layout from '../components/Layout';
import Link from '../components/Link';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import { pageTitles } from './_app';

export const messages = defineMessages({
  backupAndSync: {
    defaultMessage: 'Backup and Sync',
    id: 'backupAndSync',
  },
});

const DarkModeButton: React.FunctionComponent = () => {
  const [darkMode, setAppState] = useAppState(state => state.viewer.darkMode);
  const emoji = darkMode ? '🌛' : '🌤';
  const toggleViewerDarkMode = () => {
    setAppState(({ viewer }) => {
      viewer.darkMode = !viewer.darkMode;
    });
  };
  return (
    <Button big onPress={toggleViewerDarkMode}>
      {emoji}
    </Button>
  );
};

const EmailInput: React.FunctionComponent = () => {
  const { theme } = useAppContext();
  const [email, setAppState] = useAppState(state => state.viewer.email);
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

const Footer: React.FunctionComponent = () => {
  const { theme } = useAppContext();
  return (
    <View style={theme.layoutFooter}>
      <Text style={theme.layoutFooterText}>
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

const Me: React.FunctionComponent = () => {
  const { intl, theme } = useAppContext();
  const title = intl.formatMessage(pageTitles.me);
  const [backAndSyncShown, setBackupAndSyncShown] = React.useState(false);

  return (
    <Layout title={title}>
      <View style={theme.flex1}>
        <View style={theme.buttons}>
          <DarkModeButton />
        </View>
        <View style={theme.buttons}>
          <Button onPress={() => setBackupAndSyncShown(!backAndSyncShown)}>
            {intl.formatMessage(messages.backupAndSync)}
          </Button>
        </View>
        {backAndSyncShown && (
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
      </View>
      <Footer />
    </Layout>
  );
};

export default Me;
