import App, { Container } from 'next/app';
import React from 'react';
import { defineMessages, IntlProvider } from 'react-intl';
import IntlProviderFix from '../components/IntlProviderFix';
import ThemeConsumer from '../components/ThemeConsumer';
import AppContext from '../contexts/AppContext';

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
    defaultMessage: 'Actual Tasks (something like retired Google Gmail Tasks)',
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
      </Container>
    );
  }
}
