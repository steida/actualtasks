import { rootTaskListId } from '@app/state/appStateConfig';
import { useMemo } from 'react';
import { OmitByValue } from 'utility-types/dist/mapped-types';
import useAppContext from './useAppContext';

export type AppHref =
  | {
      pathname: '/';
      query?: {
        id: string;
        view?: 'archived';
      } | null;
    }
  | { pathname: 'https://twitter.com/steida' }
  | { pathname: 'https://github.com/steida/actualtasks' }
  | {
      pathname: 'https://blockstream.info/address/13fJfcXAZncP1NnMNtpG1KxEYL514jtUy3';
    }
  | { pathname: 'https://github.com/steida/actualtasks/issues/new' }
  | { pathname: '/me' }
  | { pathname: '/add' }
  | {
      pathname: '/edit';
      query?: { id: string } | null;
    }
  | {
      pathname: '/blog';
      query?: { id: string } | null;
    }
  | { pathname: '/help' }
  | { pathname: '/archived' };

// MapDiscriminatedUnion.
// https://stackoverflow.com/a/50125960/233902
type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<
  K,
  V
>
  ? T
  : never;
type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = {
  [V in T[K]]: DiscriminateUnion<T, K, V>
};
// I'm pretty sure it can be written better. But it does what we need.
type ExtractQuery<T> = OmitByValue<
  {
    [P in keyof T]: T[P] extends { query?: object | null }
      ? NonNullable<T[P]['query']>
      : never
  },
  never
>;
type AppHrefParsed = ExtractQuery<MapDiscriminatedUnion<AppHref, 'pathname'>>;

// Just typed router helper.
const useAppHref = () => {
  const { router } = useAppContext();
  const parsed = useMemo<AppHrefParsed>(() => {
    const queryId =
      (router != null &&
        router.query != null &&
        typeof router.query.id === 'string' &&
        router.query.id) ||
      null;
    const taskListId = queryId || rootTaskListId;

    return {
      '/': {
        id: taskListId,
        // TODO: Parse.
        view: undefined,
      },
      '/edit': {
        id: taskListId,
      },
      '/blog': {
        id: queryId || '', // An empty string is better than null in this case.
      },
    };
  }, [router]);

  return {
    push(href: AppHref) {
      router.push(href);
    },
    parsed,
  };
};

export default useAppHref;
