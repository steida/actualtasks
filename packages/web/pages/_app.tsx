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
        zIndex: 999,
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
  clientStateReady: boolean;
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
    // Initial render has to render the same state as on the server.
    // After that, we can fetch data, use real window width in useWindowWidth, etc.
    initialRender: true,
    //
    clientStateReady: false,
  };

  static hardRedirectToRoot() {
    // Browser redirect to purge sensitive session data.
    window.location.href = '/';
  }

  static appName = 'actualtasks';

  static localStorageKeys: { [key: string]: string } = {
    logout: `${MyApp.appName}:logout`,
  };

  logout = async () => {
    if (dbPromise == null) return;
    // Delete local data.
    (await dbPromise).mutations.dangerouslyDeleteDB();
    MyApp.hardRedirectToRoot();
  };

  handleWindowStorage = (event: StorageEvent) => {
    if (event.key === MyApp.localStorageKeys.logout) {
      MyApp.hardRedirectToRoot();
    }
  };

  // Fetch data for app and page once. Then use getInitialProps.
  async fetchClientState() {
    // There is no client state on the server.
    if (dbPromise == null) return;
    const db = await dbPromise;

    // This list of loaders must be maintained manually, we don't have Relay.
    // While it's theoretically possible to use Relay with client data, I hope
    // React Suspense will provide better API.
    await db.mutations.loadViewer();

    // if (this.props.Component.prefetch) {
    //   await...
    // }
    this.setState({ clientStateReady: true });
  }

  componentDidMount() {
    window.addEventListener('storage', this.handleWindowStorage);
    this.setState({ initialRender: false });
    this.fetchClientState();
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.handleWindowStorage);
    Object.keys(MyApp.localStorageKeys).forEach(key => {
      window.localStorage.removeItem(MyApp.localStorageKeys[key]);
    });
  }

  render() {
    const { Component: Page, initialNow, pageProps } = this.props;
    const { initialRender, clientStateReady } = this.state;
    const { logout } = this;

    return (
      <Container>
        <ClientStateProvider
          dbPromise={dbPromise}
          // Use key to reset children state. It's useful for example for
          // useWindowWidth hook which is async. It's safer to force rerender all.
          key={clientStateReady.toString()}
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
                            value={{
                              intl,
                              theme,
                              router,
                              initialRender,
                              logout,
                            }}
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
        {/* Hide rendered content until the client state is fetched. */}
        {/* Remember we have to render content anyway to be indexed. */}
        {!clientStateReady && <SplashScreen />}
      </Container>
    );
  }
}
