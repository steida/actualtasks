import appStateConfig from '@app/state/appStateConfig';
import { AppStateProvider } from '@app/state/lib/appstate';
import App, { Container } from 'next/app';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { View } from 'react-native';
import IntlProviderFix from '../components/IntlProviderFix';
import RouterProviderFix from '../components/RouterProviderFix';
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
                <RouterProviderFix>
                  {router => (
                    <ThemeConsumer>
                      {theme => (
                        <AppContext.Provider value={{ intl, theme, router }}>
                          <Page {...pageProps} />
                        </AppContext.Provider>
                      )}
                    </ThemeConsumer>
                  )}
                </RouterProviderFix>
              )}
            </IntlProviderFix>
          </IntlProvider>
        </AppStateProvider>
      </Container>
    );
  }
}
