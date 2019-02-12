import Head from 'next/head';
import { withRouter } from 'next/router';
import React from 'react';
import { findNodeHandle, StyleSheet, Text, View } from 'react-native';
import isEmail from 'validator/lib/isEmail';
import Gravatar from '../components/Gravatar';
import useAppContext from '../hooks/useAppContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppHref } from '../pages/_app';
import Link from './Link';

let initialRender = true;

interface LayoutContextType {
  focusHeader: () => void;
}

export const LayoutContext = React.createContext<LayoutContextType>({
  focusHeader: () => {
    throw new Error('No LayoutContext.Provider');
  },
});

const LayoutHeader = withRouter(({ router }) => {
  const { theme } = useAppContext();
  const [storageEmail] = useLocalStorage('email');
  const personHref: AppHref =
    router && router.pathname === '/' ? '/me' : { pathname: '/' };

  const email = isEmail(storageEmail) ? storageEmail : '';

  return (
    <View style={[theme.layoutHeader, theme.marginStartAuto]}>
      <Text style={theme.text}>
        <Link prefetch href={personHref}>
          {email ? (
            <Gravatar
              email={email}
              inline
              rounded
              size={StyleSheet.flatten(theme.text).lineHeight}
            />
          ) : (
            '👤'
          )}
        </Link>
      </Text>
    </View>
  );
});

interface LayoutProps {
  title: string;
}

const Layout: React.FunctionComponent<LayoutProps> = props => {
  const { theme } = useAppContext();
  const [htmlBackgroundColor] = React.useMemo(() => {
    return [StyleSheet.flatten(theme.layout).backgroundColor || '#fff'];
  }, [theme.layout]);
  const layoutBodyRef = React.useRef<View>(null);

  React.useEffect(() => {
    maybeFocusLayoutBody();
  }, []);

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

  const focusHeader = () => {
    // Assuming the header is first focusable element in document.
    const focusable: HTMLElement | null = document.querySelector(
      '[data-focusable]',
    );
    // TODO: Investigate why first focus will not show outline. It's probably
    // something related to RNW. Maybe it's feature. User using key navigation
    // solely will not run over it anyway.
    if (focusable) focusable.focus();
  };

  return (
    <>
      <Head>
        <title>{props.title}</title>
        <meta name="theme-color" content={htmlBackgroundColor} />
        <style>{` html { background-color: ${htmlBackgroundColor} } `}</style>
      </Head>
      <LayoutContext.Provider value={{ focusHeader }}>
        <View style={theme.layout}>
          <View style={theme.layoutContainer}>
            <LayoutHeader />
            <View ref={layoutBodyRef} style={theme.layoutBody}>
              {props.children}
            </View>
          </View>
        </View>
      </LayoutContext.Provider>
    </>
  );
};

export default Layout;
