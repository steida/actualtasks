import App, { Container } from 'next/app';
import React from 'react';
import { defineMessages, IntlProvider } from 'react-intl';
import IntlProviderFix from '../components/IntlProviderFix';
import AppContext from '../contexts/AppContext';

// import darkTheme, { name as darkThemeName } from '../themes/dark';
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

export default class MyApp extends App<MyAppProps> {
  static async getInitialProps(): Promise<MyAppProps> {
    const props = {
      initialNow: Date.now(),
      pageProps: { data: null },
    };

    return props;
  }

  render() {
    const { Component: Page, initialNow, pageProps } = this.props;
    const theme = lightTheme;

    return (
      <Container>
        <IntlProvider
          locale="en"
          initialNow={initialNow}
          textComponent={React.Fragment}
        >
          <IntlProviderFix>
            {intl => (
              <AppContext.Provider value={{ intl, theme }}>
                <Page {...pageProps} />
              </AppContext.Provider>
            )}
          </IntlProviderFix>
        </IntlProvider>
      </Container>
    );
  }
}
