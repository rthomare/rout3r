import { useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getRoutes } from '../lib/onchain';

export function Debug() {
  const walletClient = useWalletClient();
  const [routes, setRoutes] = useState<any>();
  useEffect(() => {
    if (!walletClient.data) {
      return;
    }
    getRoutes(walletClient.data, 0n, 10n).then((routes) => {
      console.log('Routes:', routes);
      setRoutes(routes);
    });
  }, [walletClient.data]);

  if (!walletClient.data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Debug</h1>
      <div>Account: {walletClient.data.account.address}</div>
      <div>Chain: {walletClient.data.chain.name}</div>
      <div>Routes: {routes}</div>
    </div>
  );
}
