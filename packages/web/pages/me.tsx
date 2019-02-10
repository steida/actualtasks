import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, View } from 'react-native';
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
  const emoji = darkMode ? '🌛' : '🌤';

  return (
    <Layout title={title}>
      <View style={{ flex: 1 }}>
        <View style={theme.buttons}>
          <Button onPress={() => setDarkMode(!darkMode)}>{emoji}</Button>
        </View>
      </View>
      <Footer />
    </Layout>
  );
};

export default Me;
