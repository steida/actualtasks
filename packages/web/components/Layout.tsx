import Head from 'next/head';
import React from 'react';
import { findNodeHandle, StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import useAppContext from '../hooks/useAppContext';
import useLocalStorage from '../hooks/useLocalStorage';

let initialRender = true;

const LayoutHeader = () => {
  const { theme } = useAppContext();
  const [darkMode, setDarkMode] = useLocalStorage('darkMode');
  const emoji = darkMode ? '🌛' : '🌤';
  return (
    <View style={[theme.layoutHeader, theme.marginStartAuto]}>
      <Button onPress={() => setDarkMode(!darkMode)}>{emoji}</Button>
    </View>
  );
};

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

  return (
    <>
      <Head>
        <title>{props.title}</title>
        <meta name="theme-color" content={htmlBackgroundColor} />
        <style>{` html { background-color: ${htmlBackgroundColor} } `}</style>
      </Head>
      <View style={theme.layout}>
        <View style={theme.layoutContainer}>
          <LayoutHeader />
          <View ref={layoutBodyRef} style={theme.layoutBody}>
            {props.children}
          </View>
        </View>
      </View>
    </>
  );
};

export default Layout;
