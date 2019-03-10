import React, { FunctionComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import isEmail from 'validator/lib/isEmail';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import usePageTitles from '@app/hooks/usePageTitles';
import Button from '@app/components/Button';
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

// const Backup: FunctionComponent = () => {
//   const { theme } = useAppContext();
//   return (
//     <View style={[theme.buttons, theme.marginBottom]}>
//       <Button type="primary">
//         <FormattedMessage defaultMessage="Backup" id="backup" />
//       </Button>
//     </View>
//   );
// };

// const Reset: FunctionComponent = () => {
//   const { theme } = useAppContext();
//   return (
//     <View style={[theme.buttons, theme.marginBottom]}>
//       <Button type="danger" label="Delete all" />
//     </View>
//   );
// };

// const Sync: FunctionComponent = () => {
//   const { theme } = useAppContext();
//   return (
//     <Text style={theme.paragraph}>
//       <FormattedMessage
//         defaultMessage="Syncing across devices with end to end encryption will be released soon."
//         id="viewerSync"
//       />
//     </Text>
//   );
// };

const Me: FunctionComponent = () => {
  const pageTitles = usePageTitles();
  const { theme } = useAppContext();

  return (
    <Layout title={pageTitles.me}>
      <View style={theme.buttons}>
        <DarkModeButton />
      </View>
      <ViewerEmail />
      {/* <Backup />
      <Reset />
      <Sync /> */}
    </Layout>
  );
};

export default Me;
