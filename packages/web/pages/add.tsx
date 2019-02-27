import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Text, TextInput } from 'react-native';
// import isEmail from 'validator/lib/isEmail';
// import Button from '../components/Button';
import Layout from '../components/Layout';
import useAppContext from '../hooks/useAppContext';
// import useAppState from '../hooks/useAppState';
import { pageTitles } from './_app';

const NameInput: React.FunctionComponent = () => {
  const { theme } = useAppContext();
  const [name, setName] = useState('');
  // const labelIsValid = email === '' || isEmail(email);
  const labelIsValid = true;

  return (
    <>
      <Text style={[theme.label, !labelIsValid && theme.labelInvalid]}>
        <FormattedMessage defaultMessage="Name" id="nameLabel" />
      </Text>
      <TextInput
        keyboardType="email-address"
        onChangeText={text => setName(text)}
        style={theme.textInputOutline}
        value={name}
      />
    </>
  );
};

const Add: React.FunctionComponent = () => {
  const { intl } = useAppContext();
  const title = intl.formatMessage(pageTitles.add);

  return (
    <Layout title={title}>
      <NameInput />
    </Layout>
  );
};

export default Add;
