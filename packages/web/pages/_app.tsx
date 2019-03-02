import appStateConfig from '@app/state/appStateConfig';
import { AppStateProvider } from '@app/state/lib/appstate';
import App, { Container } from 'next/app';
import React from 'react';
import { defineMessages, IntlProvider } from 'react-intl';
import { View } from 'react-native';
import IntlProviderFix from '../components/IntlProviderFix';
import ThemeConsumer from '../components/ThemeConsumer';
import AppContext from '../contexts/AppContext';

const SplashScreen = () => {
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#fff',
      }}
    />
  );
};

interface MyAppProps {
  initialNow: number;
  pageProps: {};
}

export default class MyApp extends App<MyAppProps> {
  static localStorageKey = 'actualtasks';

  static async getInitialProps(): Promise<MyAppProps> {
    const props = {
      initialNow: Date.now(),
      pageProps: { data: null },
    };

    return props;
  }

  render() {
    const { Component: Page, initialNow, pageProps } = this.props;

    return (
      <Container>
        <AppStateProvider
          config={appStateConfig}
          splashScreen={<SplashScreen />}
        >
          <IntlProvider
            locale="en"
            initialNow={initialNow}
            textComponent={React.Fragment}
          >
            <IntlProviderFix>
              {intl => (
                <ThemeConsumer>
                  {theme => (
                    <AppContext.Provider value={{ intl, theme }}>
                      <Page {...pageProps} />
                    </AppContext.Provider>
                  )}
                </ThemeConsumer>
              )}
            </IntlProviderFix>
          </IntlProvider>
        </AppStateProvider>
      </Container>
    );
  }
}

// Page titles can not be collocated within pages because that would defeat
// code splitting. One nav component would import many whole pages.
export const pageTitles = defineMessages({
  index: {
    defaultMessage: 'Actual Tasks',
    id: 'pageTitles.index',
  },
  me: {
    defaultMessage: 'Me',
    id: 'pageTitles.me',
  },
  add: {
    defaultMessage: 'Add',
    id: 'pageTitles.add',
  },
});
