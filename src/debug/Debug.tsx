import { useEffect, useState } from 'react';

import { useOnchain } from '../hooks/useOnchain';
import { getRoutes } from '../lib/onchain';
import { Route } from '../lib/types';

export function Debug() {
  const { config } = useOnchain();
  const [routes, setRoutes] = useState<{
    routes: Route[];
    cursor: string;
    length: bigint;
  }>();
  useEffect(() => {
    getRoutes(config, '', 10n).then((retreived) => {
      setRoutes(retreived);
    });
  }, [config]);

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Debug</h1>
      <div>Account: {config.walletClient.account.address}</div>
      <div>Chain: {config.walletClient.chain.name}</div>
      <div>Routes: {JSON.stringify(routes?.routes)}</div>
    </div>
  );
}
