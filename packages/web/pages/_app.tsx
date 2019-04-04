import appStateConfig from '@app/state/appStateConfig';
import { AppStateProvider } from '@app/state/lib/appstate';
import App, { Container, NextAppContext } from 'next/app';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { View } from 'react-native';
import { AppContext } from '@app/hooks/useAppContext';
import IntlProviderFix from '@app/components/IntlProviderFix';
import ThemeConsumer from '@app/components/ThemeConsumer';
import RouterProviderFix from '@app/components/RouterProviderFix';
import ClientStateProvider from '@app/clientstate/ClientStateProvider';
import { createDB } from '../db/createDB';

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

// Create DB asap. TODO: Move to web worker.
const isServer = typeof window === 'undefined';
const dbPromise = isServer ? null : createDB();

interface MyAppProps {
  initialNow: number;
  pageProps: {};
}

interface MyAppState {
  initialRender: boolean;
}

export default class MyApp extends App<MyAppProps, MyAppState> {
  static async getInitialProps(_context: NextAppContext): Promise<MyAppProps> {
    const props = {
      initialNow: Date.now(),
      pageProps: { data: null },
    };
    // const db = await getDB()
    // na serveru nedelat nic
    // no? jak nakrmim prvni render?
    // co kdyz zmenim url, a db stale neni?
    // tak lazy
    // ale db dostane i provider, ok
    // db je proste repository
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
        <ClientStateProvider
          dbPromise={dbPromise}
          splashScreen={<SplashScreen />}
        >
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
        </ClientStateProvider>
      </Container>
    );
  }
}
