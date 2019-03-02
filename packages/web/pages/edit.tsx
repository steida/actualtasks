import React from 'react';
import { pageTitles } from './_app';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';

const Edit: React.FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.add);

  return <Layout title={title}>{/* <NameInput /> */}</Layout>;
};

export default Edit;
