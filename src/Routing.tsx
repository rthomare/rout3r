import { Address } from 'viem';
import { processQuery } from './lib/engine';
import { useEffect } from 'react';
import { RequestProperties } from './lib/types';
import { useSearchRoute } from './lib/endpoints';
import { LoadingScreen } from './components/LoadingScreen';

export function Routing() {
  // get the query parameters after /#go
  const queryString = window.location.href.split('/#go?')[1];
  if (!queryString) {
    console.error('No query string');
    process.exit(1);
  }
  const params = new URLSearchParams(queryString);
  const searchFallback = params.get('searchFallback');
  const chainId = params.get('chainId');
  const rpc = params.get('rpc');
  const address = params.get('address') as Address;
  const contract = params.get('contract') as Address;
  const query = params.get('q');
  if (!searchFallback || !rpc || !address || !contract || !chainId) {
    console.error(
      'The URL was not setup correctly please check to see that ' +
        'searchFallback, rpc, address, chainId, & contract were all setup correctly'
    );
    process.exit(1);
  }

  const requestProperties: RequestProperties = {
    searchFallback,
    chainId: parseInt(chainId),
    rpc,
    address,
    contract,
  };
  const searchRoute = useSearchRoute(requestProperties);

  useEffect(() => {
    processQuery(searchRoute, query ?? '', searchFallback)
      .then((url) => {
        // redirect to the processed url
        window.location.replace(url);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return <LoadingScreen summary="Processing Query" />;
}
