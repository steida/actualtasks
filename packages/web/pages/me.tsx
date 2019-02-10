import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, TextInput, View } from 'react-native';
import isEmail from 'validator/lib/isEmail';
import Button from '../components/Button';
import Layout from '../components/Layout';
import Link from '../components/Link';
import useAppContext from '../hooks/useAppContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { pageTitles } from './_app';

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
  const [darkMode, setDarkMode] = useLocalStorage('darkMode');
  const [email, setEmail] = useLocalStorage('email');
  const emoji = darkMode ? '🌛' : '🌤';
  const labelIsValid = email === '' || isEmail(email);

  return (
    <Layout title={title}>
      <View style={theme.flex1}>
        <View style={theme.buttons}>
          <Button big onPress={() => setDarkMode(!darkMode)}>
            {emoji}
          </Button>
        </View>
        <Text style={[theme.label, !labelIsValid && theme.labelInvalid]}>
          <FormattedMessage defaultMessage="Your email" id="yourEmail" />
        </Text>
        <TextInput
          keyboardType="email-address"
          onChangeText={text => setEmail(text)}
          style={theme.textInputOutline}
          value={email}
        />
      </View>
      <Footer />
    </Layout>
  );
};

export default Me;
