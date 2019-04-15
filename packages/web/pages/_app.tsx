import App, { Container, NextAppContext } from 'next/app';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { View } from 'react-native';
import { AppContext } from '@app/hooks/useAppContext';
import IntlProviderFix from '@app/components/IntlProviderFix';
import ThemeConsumer from '@app/components/ThemeConsumer';
import RouterProviderFix from '@app/components/RouterProviderFix';
import ClientStateContext from '@app/clientstate/ClientStateContext';
import { ClientDB } from '@app/clientstate/types';
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
  db: ClientDB | null;
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
    db: null,
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

  // Fetch data for the app and a page once. Then use getInitialProps.
  async fetchClientState() {
    // There is no client state on the server.
    if (dbPromise == null) return;
    const db = await dbPromise;

    // This list of loaders must be maintained manually, we don't have Relay.
    // While it's theoretically possible to use Relay with client data, I hope
    // React Suspense will provide better API. Anyway, this is good enough.
    await db.mutations.loadViewer();
    await db.mutations.loadTaskLists();

    // if (this.props.Component.prefetch) {
    //   await...
    // }
    this.setState({ db });
  }

  componentDidMount() {
    // console.log('app did mount');
    window.addEventListener('storage', this.handleWindowStorage);
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
    const { db } = this.state;
    const { logout } = this;
    // Initial render has to render the same state as on the server.
    const initialRender = db == null;
    // console.log('render app');

    return (
      <Container>
        <ClientStateContext.Provider value={db}>
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
        </ClientStateContext.Provider>
        {/* Hide rendered content until the client state is ready. */}
        {/* Remember, we have to always render content to be indexed. */}
        {initialRender && <SplashScreen />}
      </Container>
    );
  }
}
