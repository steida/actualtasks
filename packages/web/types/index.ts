// TODO: For typed parsing, use gcanti/io-ts.

export type AppHref =
  | {
      pathname: '/';
      query: { id: string } | null;
    }
  | 'https://twitter.com/steida'
  | 'https://github.com/steida/actualtasks'
  | 'https://blockstream.info/address/13fJfcXAZncP1NnMNtpG1KxEYL514jtUy3'
  | '/me'
  | '/add';
