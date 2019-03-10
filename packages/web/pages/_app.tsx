import appStateConfig from '@app/state/appStateConfig';
import { AppStateProvider } from '@app/state/lib/appstate';
import App, { Container } from 'next/app';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { View } from 'react-native';
import { AppContext } from '@app/hooks/useAppContext';
import IntlProviderFix from '@app/components/IntlProviderFix';
import ThemeConsumer from '@app/components/ThemeConsumer';
import RouterProviderFix from '../components/RouterProviderFix';

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

interface MyAppState {
  initialRender: boolean;
}

export default class MyApp extends App<MyAppProps, MyAppState> {
  static localStorageKey = 'actualtasks';

  static async getInitialProps(): Promise<MyAppProps> {
    const props = {
      initialNow: Date.now(),
      pageProps: { data: null },
    };
    return props;
  }

  state = {
    initialRender: true,
  };

  componentDidMount() {
    this.setState({ initialRender: false });
  }

  render() {
    const { Component: Page, initialNow, pageProps } = this.props;
    const { initialRender } = this.state;

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
                        <AppContext.Provider
                          value={{ intl, theme, router, initialRender }}
                        >
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
