import useAppContext from '@app/hooks/useAppContext';
import { AppHref } from '@app/hooks/useAppHref';
import { useMemo } from 'react';

const useRouteIsActive = (href: AppHref) => {
  const { router } = useAppContext();
  const hrefQuery = 'query' in href && href.query;
  const isActive = useMemo(() => {
    return (
      href.pathname === router.pathname &&
      JSON.stringify(hrefQuery || {}) === JSON.stringify(router.query || {})
    );
  }, [href.pathname, hrefQuery, router.pathname, router.query]);
  return isActive;
};

export default useRouteIsActive;
