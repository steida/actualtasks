import React, { FunctionComponent } from 'react';
import Layout from '../components/Layout';
import usePageTitles from '../hooks/usePageTitles';

const Edit: FunctionComponent = () => {
  const pageTitles = usePageTitles();
  // const taskLists = useAppState(state => state.taskLists);
  return <Layout title={pageTitles.edit('foo')}>{/* <NameInput /> */}</Layout>;
};

export default Edit;
