import React, { FunctionComponent } from 'react';
import Button from '../components/Button';
import Layout from '../components/Layout';
import Tasks from '../components/Tasks';
import useAppContext from '../hooks/useAppContext';
import { pageTitles } from './_app';

const Menu: FunctionComponent = () => {
  return (
    <>
      <Button type="gray" size="small">
        actual
      </Button>
      <Button type="gray" size="small">
        work
      </Button>
      <Button type="gray" size="small">
        life
      </Button>
      <Button type="gray" size="small">
        actual
      </Button>
      <Button type="gray" size="small">
        work
      </Button>
      <Button type="gray" size="small">
        life
      </Button>
      <Button type="gray" size="small">
        actual
      </Button>
      <Button type="gray" size="small">
        work
      </Button>
      <Button type="gray" size="small">
        life
      </Button>
    </>
  );
};

const Index: FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.index);

  return (
    <Layout title={title} menu={<Menu />}>
      <Tasks />
    </Layout>
  );
};

export default Index;
