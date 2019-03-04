/* eslint-env browser */
import Head from 'next/head';
import React, { useEffect, FunctionComponent, useMemo, useRef } from 'react';
import {
  findNodeHandle,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import isEmail from 'validator/lib/isEmail';
import Gravatar from './Gravatar';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import Link from './Link';
import useWindowWidth from '../hooks/useWindowWidth';
import Menu from './Menu';

let initialRender = true;

type ScreenSize = 'small' | 'other';

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

const LayoutHeader = () => {
  const { theme } = useAppContext();

  return (
    <View style={theme.layoutHeader}>
      <Text style={theme.text}>
        <Link prefetch href="/me">
          <ViewerGravatar />
        </Link>
      </Text>
    </View>
  );
};

interface LayoutMenuProps {
  screenSize: ScreenSize;
}

const LayoutMenu: FunctionComponent<LayoutMenuProps> = props => {
  const { theme } = useAppContext();
  const isSmallScreen = props.screenSize === 'small';
  return (
    <ScrollView
      horizontal={isSmallScreen}
      style={
        isSmallScreen
          ? theme.layoutMenuScrollViewSmallScreen
          : theme.layoutMenuScrollViewOtherScreen
      }
      contentContainerStyle={[
        theme.layoutMenuScrollViewContent,
        {
          flexDirection: isSmallScreen ? 'row' : 'column',
        },
      ]}
    >
      <Menu isSmallScreen={isSmallScreen} />
    </ScrollView>
  );
};

interface LayoutProps {
  title: string;
}

const Layout: FunctionComponent<LayoutProps> = props => {
  const { theme } = useAppContext();
  const [htmlBackgroundColor] = useMemo(() => {
    return [StyleSheet.flatten(theme.layout).backgroundColor || '#fff'];
  }, [theme.layout]);
  const layoutBodyRef = useRef<View>(null);

  // https://medium.com/@robdel12/single-page-apps-routers-are-broken-255daa310cf
  // Useful for accessibility and key navigation.
  const maybeFocusLayoutBody = () => {
    if (!layoutBodyRef.current) return;
    // Do not focus on the initial render.
    if (initialRender === true) {
      initialRender = false;
      return;
    }

    // Do not focus if something is already focused.
    const node = (findNodeHandle(layoutBodyRef.current) as unknown) as Element;
    if (node.contains(document.activeElement)) {
      return;
    }
    // Remove outline, because outline shall be shown only on key action.
    layoutBodyRef.current.setNativeProps({ style: { outline: 'none' } });
    layoutBodyRef.current.focus();
  };

  useEffect(() => {
    maybeFocusLayoutBody();
  }, [maybeFocusLayoutBody]);

  const windowWidth = useWindowWidth();
  const screenSize: ScreenSize =
    windowWidth && windowWidth > 600 ? 'other' : 'small';
  const isSmallScreen = screenSize === 'small';

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
            { flexDirection: isSmallScreen ? 'column' : 'row' },
          ]}
        >
          {isSmallScreen === false && <LayoutMenu screenSize={screenSize} />}
          <ScrollView
            style={theme.layoutContentScrollView}
            contentContainerStyle={theme.layoutContentScrollViewContent}
          >
            <View ref={layoutBodyRef}>{props.children}</View>
          </ScrollView>
          {isSmallScreen === true && <LayoutMenu screenSize={screenSize} />}
        </View>
      </View>
    </>
  );
};

export default Layout;
