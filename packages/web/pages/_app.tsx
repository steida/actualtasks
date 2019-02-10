import App, { Container } from 'next/app';
import React from 'react';
import { defineMessages, IntlProvider } from 'react-intl';
import IntlProviderFix from '../components/IntlProviderFix';
import ThemeConsumer from '../components/ThemeConsumer';
import AppContext from '../contexts/AppContext';
import WasRendered from '../contexts/WasRenderedContext';

export type AppHref =
  | {
      pathname: '/';
      query?: { id: string };
    }
  | 'https://twitter.com/steida'
  | 'https://github.com/steida/actualtasks'
  | 'https://blockstream.info/address/13fJfcXAZncP1NnMNtpG1KxEYL514jtUy3'
  | '/me';

// Page titles can not be collocated within pages because that would defeat
// code splitting. One nav component would import many whole pages.
export const pageTitles = defineMessages({
  index: {
    // Actual Tasks (something like retired Google Gmail Tasks)
    defaultMessage: 'under construction',
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

interface MyAppState {
  wasRendered: boolean;
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
    wasRendered: false,
  };

  componentDidMount() {
    this.setState({ wasRendered: true });
  }

  render() {
    const { Component: Page, initialNow, pageProps } = this.props;
    const { wasRendered } = this.state;

    return (
      <Container>
        <WasRendered.Provider value={wasRendered}>
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
        </WasRendered.Provider>
      </Container>
    );
  }
}
