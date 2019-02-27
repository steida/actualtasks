/* eslint-env browser */
import Head from 'next/head';
import React, { useEffect, FunctionComponent } from 'react';
import {
  findNodeHandle,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import isEmail from 'validator/lib/isEmail';
import { FormattedMessage } from 'react-intl';
import Gravatar from './Gravatar';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import Link from './Link';
import useWindowWidth from '../hooks/useWindowWidth';
import Menu from './Menu';

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

const LayoutFooter: React.FunctionComponent = () => {
  const { theme } = useAppContext();
  return (
    <View style={theme.layoutFooter}>
      <Text style={theme.layoutFooterText}>
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
      <Menu />
    </ScrollView>
  );
};

interface LayoutProps {
  title: string;
  noFooter?: boolean;
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
            {isSmallScreen === false && <LayoutMenu screenSize={screenSize} />}
            <ScrollView
              style={theme.layoutContentScrollView}
              contentContainerStyle={theme.layoutContentScrollViewContent}
            >
              {props.children}
            </ScrollView>
            {isSmallScreen === true && <LayoutMenu screenSize={screenSize} />}
          </View>
          {!props.noFooter && <LayoutFooter />}
        </View>
      </LayoutContext.Provider>
    </>
  );
};

export default Layout;
