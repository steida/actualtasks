/* eslint-env browser */
import Head from 'next/head';
import React, { useEffect, FunctionComponent, useMemo, useRef } from 'react';
import { findNodeHandle, ScrollView, StyleSheet, View } from 'react-native';
import isEmail from 'validator/lib/isEmail';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import useScreenSize from '@app/hooks/useScreenSize';
import usePageTitles from '@app/hooks/usePageTitles';
import { Assign, Omit } from 'utility-types';
import Gravatar from '@app/components/Gravatar';
import Link, { LinkProps } from '@app/components/Link';
import Menu from '@app/components/Menu';

const ViewerGravatar: FunctionComponent = () => {
  const { theme } = useAppContext();
  const email = useAppState(state => state.viewer.email);
  const displayEmail = isEmail(email) ? email : '';
  if (!displayEmail) return <>👤</>;
  return (
    <Gravatar
      email={displayEmail}
      inline
      rounded
      size={StyleSheet.flatten(theme.text).lineHeight}
    />
  );
};

type LayoutHeaderLinkProps = Assign<
  Omit<LinkProps, 'children'>,
  { title: string }
>;

const LayoutHeaderLink: FunctionComponent<LayoutHeaderLinkProps> = ({
  title,
  ...rest
}) => {
  const { theme } = useAppContext();
  return (
    <Link
      style={theme.layoutHeaderLink}
      activeStyle={theme.layoutHeaderLinkActive}
      prefetch
      {...rest}
    >
      {title
        .split(' ')[0]
        .trim()
        .toUpperCase()}
    </Link>
  );
};

const LayoutHeader: FunctionComponent = () => {
  const { theme } = useAppContext();
  const pageTitles = usePageTitles();

  return (
    <View style={theme.layoutHeader}>
      <LayoutHeaderLink href={{ pathname: '/blog' }} title={pageTitles.blog} />
      <Link
        style={theme.layoutHeaderLink}
        activeStyle={theme.linkImageActive}
        prefetch
        href="/me"
      >
        <ViewerGravatar />
      </Link>
    </View>
  );
};

const LayoutMenu: FunctionComponent = () => {
  const { theme } = useAppContext();
  const screenSize = useScreenSize();
  return (
    <ScrollView
      horizontal={screenSize.phoneOnly}
      style={
        screenSize.phoneOnly
          ? theme.layoutMenuScrollViewSmallScreen
          : theme.layoutMenuScrollViewOtherScreen
      }
      contentContainerStyle={[
        theme.layoutMenuScrollViewContent,
        {
          flexDirection: screenSize.phoneOnly ? 'row' : 'column',
        },
      ]}
    >
      <Menu />
    </ScrollView>
  );
};

interface LayoutProps {
  title: string;
}

const Layout: FunctionComponent<LayoutProps> = props => {
  const { theme, initialRender } = useAppContext();
  const [htmlBackgroundColor] = useMemo(() => {
    return [StyleSheet.flatten(theme.layout).backgroundColor || '#fff'];
  }, [theme.layout]);
  const layoutBodyRef = useRef<View>(null);

  // https://medium.com/@robdel12/single-page-apps-routers-are-broken-255daa310cf
  // Useful for accessibility and key navigation.
  useEffect(() => {
    if (!layoutBodyRef.current) return;
    // Do not focus on the initial render.
    if (initialRender === true) return;
    // Do not focus if something is already focused.
    const node = (findNodeHandle(layoutBodyRef.current) as unknown) as Element;
    if (node.contains(document.activeElement)) {
      return;
    }
    // Remove outline, because outline shall be shown only on key action.
    layoutBodyRef.current.setNativeProps({ style: { outline: 'none' } });
    layoutBodyRef.current.focus();
  });

  const screenSize = useScreenSize();

  return (
    <>
      <Head>
        <title>{props.title}</title>
        <meta name="theme-color" content={htmlBackgroundColor} />
        <style>{`html { background-color: ${htmlBackgroundColor} } `}</style>
      </Head>
      <View style={theme.layout}>
        <LayoutHeader />
        <View
          style={[
            theme.layoutBody,
            { flexDirection: screenSize.phoneOnly ? 'column' : 'row' },
          ]}
        >
          {!screenSize.phoneOnly && <LayoutMenu />}
          <ScrollView
            style={theme.layoutContentScrollView}
            contentContainerStyle={theme.layoutContentScrollViewContent}
          >
            <View ref={layoutBodyRef}>{props.children}</View>
          </ScrollView>
          {screenSize.phoneOnly && <LayoutMenu />}
        </View>
      </View>
    </>
  );
};

export default Layout;
