import React, { FunctionComponent } from 'react';
import usePageTitles from '@app/hooks/usePageTitles';
import useAppContext from '@app/hooks/useAppContext';
import { View, Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import Link from '@app/components/Link';
import { BlogPost, blogPosts, H1 } from '@app/components/blog';
import Layout from '@app/components/Layout';

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
