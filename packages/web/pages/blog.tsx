import React, { FunctionComponent } from 'react';
import usePageTitles from '@app/hooks/usePageTitles';
import useAppContext from '@app/hooks/useAppContext';
import { View, Text } from 'react-native';
import { FormattedRelative, FormattedDate, FormattedMessage } from 'react-intl';
import Link from '@app/components/Link';
import Layout from '../components/Layout';

// TODO: Move to @app/components/blogposts or somewhere.

const P: FunctionComponent = props => {
  const { theme } = useAppContext();
  return <Text style={[theme.text, theme.marginBottom]}>{props.children}</Text>;
};

const B: FunctionComponent = props => {
  const { theme } = useAppContext();
  return <Text style={theme.bold}>{props.children}</Text>;
};

const H1: FunctionComponent = props => {
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

const blogPosts: BlogPost[] = [releaseBlogPost];

type BlogPostProps = BlogPost & { detail?: boolean };

const BlogPost: FunctionComponent<BlogPostProps> = ({
  title,
  createdAt,
  Perex,
  Content,
  detail,
}) => {
  const { theme } = useAppContext();
  const id = title.toLowerCase();
  return (
    <View style={theme.marginTop}>
      <View style={theme.flexRow}>
        {detail ? (
          <Text style={theme.blogPostTitle}>{title}</Text>
        ) : (
          <Link
            style={theme.blogPostTitleLink}
            href={{ pathname: '/blog', query: { id } }}
          >
            {title}
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

const Footer: FunctionComponent = () => {
  const { theme } = useAppContext();
  return (
    <View style={theme.layoutFooter}>
      <Text style={theme.textSmall}>
        <Link href="https://github.com/steida/actualtasks">
          <FormattedMessage defaultMessage="made" id="madeBy" />
        </Link>
        {' by '}
        <Link href="https://twitter.com/steida">steida</Link> for {''}
        <Link href="https://blockstream.info/address/13fJfcXAZncP1NnMNtpG1KxEYL514jtUy3">
          satoshis
        </Link>
      </Text>
    </View>
  );
};

const Blog: FunctionComponent = () => {
  const pageTitles = usePageTitles();
  const { router } = useAppContext();
  const blogPostTitleByUrl =
    router.query && typeof router.query.id === 'string' && router.query.id;
  const blogPost =
    blogPostTitleByUrl &&
    blogPosts.find(post => post.title.toLowerCase() === blogPostTitleByUrl);

  if (!blogPost)
    return (
      <Layout title={pageTitles.blog}>
        <H1>Blog</H1>
        {blogPosts.map(blogPost => {
          return <BlogPost {...blogPost} key={blogPost.title} />;
        })}
        <Footer />
      </Layout>
    );

  return (
    <Layout title={blogPost.title}>
      <BlogPost {...blogPost} detail />
    </Layout>
  );
};

export default Blog;
