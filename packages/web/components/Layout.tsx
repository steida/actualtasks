/* eslint-env browser */
import Head from 'next/head';
import { withRouter } from 'next/router';
import React from 'react';
import {
  findNodeHandle,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import isEmail from 'validator/lib/isEmail';
import Gravatar from './Gravatar';
import useAppContext from '../hooks/useAppContext';
import useAppState from '../hooks/useAppState';
import { AppHref } from '../types';
import Link from './Link';
import Button from './Button';

let initialRender = true;

interface LayoutContextType {
  focusLayoutBody: () => void;
}

export const LayoutContext = React.createContext<LayoutContextType>({
  focusLayoutBody: () => {
    throw new Error('No LayoutContext.Provider');
  },
});

const ViewerGravatar: React.FunctionComponent = () => {
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

interface LayoutProps {
  title: string;
  footer?: React.ReactElement;
}

const Layout: React.FunctionComponent<LayoutProps> = props => {
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
    layoutBodyRef.current.setNativeProps({ style: { outline: 'none' } });
    layoutBodyRef.current.focus();
  };

  React.useEffect(() => {
    maybeFocusLayoutBody();
  }, [maybeFocusLayoutBody]);

  const focusLayoutBody = () => {
    if (!layoutBodyRef.current) return;
    layoutBodyRef.current.focus();
  };

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
          <View style={theme.layoutBody} ref={layoutBodyRef}>
            <ScrollView
              style={theme.layoutScrollViewSidebar}
              contentContainerStyle={theme.layoutScrollViewContainer}
            >
              <Button type="gray" size="small">
                slate se imho
              </Button>
              <Button type="gray" size="small">
                jako, jo
              </Button>
              <Button type="gray" size="small">
                fooooo
              </Button>
              <Button type="gray" size="small">
                Je možný{' '}
              </Button>
              <Button type="gray" size="small">
                fooooo
              </Button>
              <Button type="gray" size="small">
                ACDC
              </Button>
              <Button type="gray" size="small">
                fooooo
              </Button>
              <Button type="gray" size="small">
                fooooo
              </Button>
            </ScrollView>
            <ScrollView
              style={theme.layoutScrollView}
              contentContainerStyle={theme.layoutScrollViewContainer}
            >
              {props.children}
            </ScrollView>
          </View>
          {props.footer}
        </View>
      </LayoutContext.Provider>
    </>
  );
};

export default Layout;
