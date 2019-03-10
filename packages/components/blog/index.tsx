import React, { FunctionComponent } from 'react';
import { FormattedRelative, FormattedDate, FormattedMessage } from 'react-intl';
import useAppContext from '@app/hooks/useAppContext';
import { View, Text } from 'react-native';
import Link from '@app/components/Link';
import title from 'title';

const P: FunctionComponent = props => {
  const { theme } = useAppContext();
  return <Text style={[theme.text, theme.marginBottom]}>{props.children}</Text>;
};

const B: FunctionComponent = props => {
  const { theme } = useAppContext();
  return <Text style={theme.bold}>{props.children}</Text>;
};

export const H1: FunctionComponent = props => {
  const { theme } = useAppContext();
  return <Text style={theme.heading1}>{props.children}</Text>;
};

// const H2: FunctionComponent = props => {
//   const { theme } = useAppContext();
//   return <Text style={theme.heading2}>{props.children}</Text>;
// };

interface BlogPost {
  title: string;
  createdAt: number;
  // Perex is Component not Element because Element is evaluated immediately.
  Perex: React.FunctionComponent;
  Content: React.FunctionComponent;
}

const releaseBlogPost = {
  title: 'Release',
  createdAt: 1552173198616,
  Perex: () => (
    <>
      <P>Software should be released as soon as possible, so I did. </P>
    </>
  ),
  Content: () => (
    <>
      <P>"Warning: This version of Google Tasks will go away soon."</P>
      <P>
        That's why I made <B>Actual Tasks</B>.
      </P>
      <P>More soon.</P>
    </>
  ),
};

export const blogPosts: BlogPost[] = [releaseBlogPost];

type BlogPostProps = BlogPost & { detail?: boolean };

export const BlogPost: FunctionComponent<BlogPostProps> = ({
  title: blogPostTitle,
  createdAt,
  Perex,
  Content,
  detail,
}) => {
  const { theme } = useAppContext();
  const id = blogPostTitle.toLowerCase();
  // Bad type definitions so we have to cast.
  const titledTitle = (title(blogPostTitle) as any) as string;
  return (
    <View style={theme.marginTop}>
      <View style={theme.flexRow}>
        {detail ? (
          <Text style={theme.blogPostTitle}>{titledTitle}</Text>
        ) : (
          <Link
            style={theme.blogPostTitleLink}
            href={{ pathname: '/blog', query: { id } }}
          >
            {titledTitle}
          </Link>
        )}
      </View>
      <Text style={[theme.textSmallGray, theme.marginBottom]}>
        <FormattedDate
          value={createdAt}
          day="numeric"
          month="long"
          year="numeric"
        />{' '}
        (<FormattedRelative value={createdAt} />)
      </Text>
      <Perex />
      {detail && <Content />}
      {!detail && (
        <View style={theme.flexRow}>
          <Link
            style={theme.blogPostReadMoreLink}
            href={{ pathname: '/blog', query: { id } }}
          >
            <FormattedMessage defaultMessage="READ MORE" id="readMore" />
          </Link>
        </View>
      )}
    </View>
  );
};
