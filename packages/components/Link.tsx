import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import React from 'react';
import { Platform, Text, TextStyle, StyleProp } from 'react-native';
import { Assign, Omit, Overwrite } from 'utility-types';
import useAppContext from '@app/hooks/useAppContext';
import { AppHref } from '../web/types';
import useRouteIsActive from '../web/hooks/useRouteIsActive';

export type LinkProps = Assign<
  Overwrite<
    Omit<NextLinkProps, 'passHref'>,
    {
      // Allow string etc.
      children: React.ReactNode;
      // Make href required and typed.
      href: AppHref;
    }
  >,
  {
    accessible?: boolean;
    style?: StyleProp<TextStyle>;
    activeStyle?: StyleProp<TextStyle>;
  }
>;

const Link: React.FunctionComponent<LinkProps> = props => {
  const { theme } = useAppContext();
  const [hasHover, setHasHover] = React.useState(false);
  const { children, accessible, style, activeStyle, href, ...rest } = props;
  const routeIsActive = useRouteIsActive(href);

  return (
    <NextLink {...rest} href={href} passHref>
      <Text
        style={[
          style || theme.link,
          (hasHover || routeIsActive) && (activeStyle || theme.linkActive),
        ]}
        accessibilityRole="link"
        accessible={accessible}
        {...Platform.select({
          web: {
            onMouseEnter: () => setHasHover(true),
            onMouseLeave: () => setHasHover(false),
          },
        })}
      >
        {children}
      </Text>
    </NextLink>
  );
};

export default Link;
