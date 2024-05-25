import { useEffect, useState } from 'react';
import { getRoutes } from '../lib/onchain';
import { useOnchain } from '../hooks/useOnchain';

export function Debug() {
  const { config } = useOnchain();
  const [routes, setRoutes] = useState<any>();
  useEffect(() => {
    getRoutes(config, 0n, 10n).then((routes) => {
      console.log('Routes:', routes);
      setRoutes(routes);
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
      <div>Routes: {routes}</div>
    </div>
  );
}
