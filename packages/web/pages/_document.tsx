import Document, {
  Head,
  Main,
  NextDocumentContext,
  NextScript,
} from 'next/document';
import React from 'react';
import { AppRegistry } from 'react-native';

// Force Next-generated DOM elements to fill their parent's height.
// Disable native outline because we handle it.
// https://github.com/necolas/react-native-web/blob/master/docs/guides/client-side-rendering.md
// https://github.com/zeit/next.js/blob/canary/examples/with-react-native-web/pages/_document.js
const globalStyles = `
  #__next{display:flex;flex-direction:column;height:100%}
  *{outline:none}
  body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
`;

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }: NextDocumentContext) {
    AppRegistry.registerComponent('Main', () => Main);
    // @ts-ignore getApplication is React Native Web addition for SSR.
    const { getStyleElement } = AppRegistry.getApplication('Main');
    const page = renderPage();
    const styles = [
      // eslint-disable-next-line react/no-danger
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} key="styles" />,
      getStyleElement(),
    ];
    return { ...page, styles: React.Children.toArray(styles) };
  }

  render() {
    return (
      <html lang="en" style={{ height: '100%' }}>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <body style={{ height: '100%', overflow: 'hidden' }}>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
