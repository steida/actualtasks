import React, { FunctionComponent } from 'react';
import usePageTitles from '@app/hooks/usePageTitles';
import { Text } from 'react-native';
import useAppContext from '@app/hooks/useAppContext';
import { FormattedMessage } from 'react-intl';
import Link from '@app/components/Link';
import Layout from '@app/components/Layout';

const Help: FunctionComponent = () => {
  const { theme } = useAppContext();
  const pageTitles = usePageTitles();

  return (
    <Layout title={pageTitles.help}>
      <Text style={theme.heading1}>
        <FormattedMessage defaultMessage="Help" id="helpTitle" />
      </Text>
      <Text style={[theme.heading2]}>
        <FormattedMessage defaultMessage="Keyboard Navigation" id="helpTitle" />
      </Text>
      <Text style={theme.text}>
        <Text style={theme.bold}>tab</Text>: Moves the task to the right (makes
        the task a sub-task).
      </Text>
      <Text style={theme.paragraph}>
        <Text style={theme.bold}>shift + tab</Text>: Moves the task to the left.
      </Text>
      <Text style={theme.paragraph}>
        <Text style={theme.bold}>cmd (Mac) / ctrl (Win) + up / down</Text>:
        Moves the task up or down the list.
      </Text>
      <Text style={theme.paragraph}>
        <Text style={theme.bold}>escape</Text>: Focus the task list in the menu.
      </Text>
      <Text style={theme.text}>
        <Text style={theme.bold}>alt + enter</Text>: Marks a task as complete
        (will also mark a completed task as incomplete).
      </Text>
      {/* <Text style={theme.text}>Shift + Enter: Edits the current task.</Text> */}
      {/* <Text style={theme.text}>
        Alt + Shift + Enter: Removes completed task from the list.
      </Text> */}
      <Text style={[theme.heading2, theme.marginTop]}>
        <FormattedMessage
          defaultMessage="Something Does Not Work?"
          id="helpIssues"
        />
      </Text>
      <Text style={theme.text}>
        <Link href="https://github.com/steida/actualtasks/issues/new">
          <FormattedMessage
            defaultMessage="Please, report it."
            id="helpNewIssueLink"
          />
        </Link>
      </Text>
    </Layout>
  );
};

export default Help;
