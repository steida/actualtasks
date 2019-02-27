/* eslint-env browser */
import Head from 'next/head';
import { withRouter } from 'next/router';
import React, { useEffect, FunctionComponent } from 'react';
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
import { AppHref } from '../types';
import Link from './Link';
import useWindowWidth from '../hooks/useWindowWidth';

let initialRender = true;

interface LayoutContextType {
  focusLayoutBody: () => void;
}

type ScreenSize = 'small' | 'other';

export const LayoutContext = React.createContext<LayoutContextType>({
  focusLayoutBody: () => {
    throw new Error('No LayoutContext.Provider');
  },
});

const ViewerGravatar: FunctionComponent = () => {
  const { theme } = useAppContext();
  const [email] = useAppState(state => state.viewer.email);
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

const LayoutHeader = withRouter(({ router }) => {
  const { theme } = useAppContext();
  const personHref: AppHref =
    router && router.pathname === '/' ? '/me' : { pathname: '/' };

  return (
    <View style={theme.layoutHeader}>
      <Text style={theme.text}>
        <Link prefetch href={personHref}>
          <ViewerGravatar />
        </Link>
      </Text>
    </View>
  );
});

interface LayoutMenuProps {
  menu?: React.ReactElement;
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
      {props.menu}
    </ScrollView>
  );
};

interface LayoutProps {
  title: string;
  menu?: React.ReactElement;
  footer?: React.ReactElement;
}

const Layout: FunctionComponent<LayoutProps> = props => {
  const { theme } = useAppContext();
  const [htmlBackgroundColor] = React.useMemo(() => {
    return [StyleSheet.flatten(theme.layout).backgroundColor || '#fff'];
  }, [theme.layout]);
  const layoutBodyRef = React.useRef<View>(null);

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
    // TODO: Why outline none?
    layoutBodyRef.current.setNativeProps({ style: { outline: 'none' } });
    layoutBodyRef.current.focus();
  };

  useEffect(() => {
    maybeFocusLayoutBody();
  }, [maybeFocusLayoutBody]);

  const focusLayoutBody = () => {
    if (!layoutBodyRef.current) return;
    layoutBodyRef.current.focus();
  };

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
      <LayoutContext.Provider value={{ focusLayoutBody }}>
        <View style={theme.layout}>
          <LayoutHeader />
          <View
            style={[
              theme.layoutBody,
              { flexDirection: isSmallScreen ? 'column' : 'row' },
            ]}
            ref={layoutBodyRef}
          >
            {isSmallScreen === false && (
              <LayoutMenu screenSize={screenSize} menu={props.menu} />
            )}
            <ScrollView
              style={theme.layoutContentScrollView}
              contentContainerStyle={theme.layoutContentScrollViewContent}
            >
              {props.children}
            </ScrollView>
            {isSmallScreen === true && (
              <LayoutMenu screenSize={screenSize} menu={props.menu} />
            )}
          </View>
          {props.footer}
        </View>
      </LayoutContext.Provider>
    </>
  );
};

export default Layout;
