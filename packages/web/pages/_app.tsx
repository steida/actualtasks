import App, { Container } from 'next/app';
import React from 'react';
import { defineMessages, IntlProvider } from 'react-intl';
import IntlProviderFix from '../components/IntlProviderFix';
import AppContext from '../contexts/AppContext';
// import { LocalStorageDarkMode } from '../hooks/useLocalStorage';
import darkTheme from '../themes/dark';
import lightTheme from '../themes/light';

export type AppHref =
  | {
      pathname: '/';
      query?: { id: string };
    }
  | 'https://twitter.com/steida';

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
});

interface MyAppProps {
  initialNow: number;
  pageProps: {};
}

export interface MyAppState {
  darkMode: boolean;
}

const initialState = {
  darkMode: false,
};

export default class MyApp extends App<MyAppProps, MyAppState> {
  static localStorageKey = 'actualtasks';

  static async getInitialProps(): Promise<MyAppProps> {
    const props = {
      initialNow: Date.now(),
      pageProps: { data: null },
    };

    return props;
  }

  state = initialState;

  componentDidMount() {
    let state: MyAppState | null = null;
    try {
      const item = localStorage.getItem(MyApp.localStorageKey);
      if (item == null) return;
      state = JSON.parse(item);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      return;
    }
    this.setState(state);
  }

  setAppState = (callback: (state: MyAppState) => MyAppState) => {
    const newState = callback(this.state);
    this.setState(newState);
    localStorage.setItem(MyApp.localStorageKey, JSON.stringify(newState));
  };

  render() {
    const { Component: Page, initialNow, pageProps } = this.props;
    const appState = this.state;
    const theme = appState.darkMode ? darkTheme : lightTheme;

    return (
      <Container>
        <IntlProvider
          locale="en"
          initialNow={initialNow}
          textComponent={React.Fragment}
        >
          <IntlProviderFix>
            {intl => (
              <AppContext.Provider
                value={{
                  appState,
                  intl,
                  setAppState: this.setAppState,
                  theme,
                }}
              >
                <Page {...pageProps} />
              </AppContext.Provider>
            )}
          </IntlProviderFix>
        </IntlProvider>
      </Container>
    );
  }
}
