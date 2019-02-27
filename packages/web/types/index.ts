export type AppHref =
  | {
      pathname: '/';
      query?: { id: string };
    }
  | 'https://twitter.com/steida'
  | 'https://github.com/steida/actualtasks'
  | 'https://blockstream.info/address/13fJfcXAZncP1NnMNtpG1KxEYL514jtUy3'
  | '/me'
  | '/add';
