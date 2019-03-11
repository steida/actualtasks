import React, { FunctionComponent, useState, useContext } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import isEmail from 'validator/lib/isEmail';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import usePageTitles from '@app/hooks/usePageTitles';
import Button from '@app/components/Button';
import { AppStateContext } from '@app/state/lib/appstate';
import Layout from '../components/Layout';

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

const ViewerEmail: FunctionComponent = () => {
  const { theme } = useAppContext();
  const email = useAppState(state => state.viewer.email);
  const setAppState = useAppState();
  const setViewerEmail = (email: string) =>
    setAppState(({ viewer }) => {
      viewer.email = email;
    });
  const labelIsValid = email === '' || isEmail(email);

  return (
    <View style={theme.marginBottom}>
      <Text style={[theme.label, !labelIsValid && theme.labelInvalid]}>
        <FormattedMessage defaultMessage="Email" id="viewerEmailLabel" />
      </Text>
      <TextInput
        keyboardType="email-address"
        onChangeText={text => setViewerEmail(text)}
        style={theme.textInputOutline}
        value={email}
      />
      <Text style={theme.textSmall}>
        <FormattedMessage
          defaultMessage="Your email is stored only in your device."
          id="viewerEmailExplanation"
        />
      </Text>
    </View>
  );
};

const messages = defineMessages({
  deleteAllData: {
    defaultMessage: 'Delete All Data',
    id: 'mePage.deleteAllData',
  },
  export: {
    defaultMessage: 'Export',
    id: 'mePage.export',
  },
});

const DeleteAllData: FunctionComponent = () => {
  const { theme, intl } = useAppContext();
  const [shown, setShown] = useState(false);
  const viewerEmail = useAppState(state => state.viewer.email);
  const [email, setEmail] = useState('');
  const appStateContext = useContext(AppStateContext);

  const handleDeletePress = () => {
    appStateContext.deleteAppState(() => {
      // Browser redirect to purge sensitive session data.
      window.location.href = '/';
    });
  };

  return (
    <>
      <View style={[theme.buttons, theme.marginBottom]}>
        <Button
          type="text"
          onPress={() => setShown(!shown)}
          title={intl.formatMessage(messages.deleteAllData)}
        />
      </View>
      {shown && (
        <View>
          <TextInput
            keyboardType="email-address"
            onChangeText={text => setEmail(text)}
            style={theme.textInputOutline}
            value={email}
          />
          <Text style={theme.textSmall}>
            <FormattedMessage
              defaultMessage="Please type in your email to confirm."
              id="deleteAllData.explanation"
            />
          </Text>
          <View style={[theme.buttons, theme.marginTop]}>
            <Button
              type="danger"
              disabled={email !== viewerEmail}
              title={intl.formatMessage(messages.deleteAllData)}
              onPress={handleDeletePress}
            />
          </View>
        </View>
      )}
    </>
  );
};

const ExportData: FunctionComponent = () => {
  const { theme, intl } = useAppContext();
  const [shown, setShown] = useState(false);
  const SerializedAppStateInput: FunctionComponent = () => {
    const appState = useAppState(state => state);
    const [serializedAppState] = useState(() => JSON.stringify(appState));
    return (
      <TextInput
        editable={false}
        style={theme.textInputOutline}
        value={serializedAppState}
      />
    );
  };

  return (
    <>
      <View style={[theme.buttons, theme.marginBottom]}>
        <Button
          type="text"
          onPress={() => setShown(!shown)}
          title={intl.formatMessage(messages.export)}
        />
      </View>
      {shown && (
        <View>
          <SerializedAppStateInput />
          <Text style={theme.textSmall}>
            <FormattedMessage
              defaultMessage="Copy paste exported state somewhere."
              id="importExport.serilizedState"
            />
          </Text>
        </View>
      )}
    </>
  );
};

const Me: FunctionComponent = () => {
  const pageTitles = usePageTitles();
  const { theme } = useAppContext();

  return (
    <Layout title={pageTitles.me}>
      <View style={theme.buttons}>
        <DarkModeButton />
      </View>
      <ViewerEmail />
      <ExportData />
      <DeleteAllData />
    </Layout>
  );
};

export default Me;
