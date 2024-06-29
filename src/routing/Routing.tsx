import { useEffect } from 'react';

import { Button, Center, Fade, Heading, Link, VStack } from '@chakra-ui/react';

import { LoadingScreen } from '../components/LoadingScreen';
import { useAppSettings } from '../hooks/useAppSettings';
import { useSearchRoute } from '../lib/endpoints';
import { processQuery } from '../lib/engine';
import { origin } from '../utils/general';

export function NoSettings() {
  const or = origin();
  return (
    <Center w="100vw" h="100vh">
      <VStack>
        <Heading>no settings were found for your Router</Heading>
        <Heading size="md">try going through the setup process again</Heading>
        <Link target="_blank" href={`${or}/#setup`}>
          <Button>go to Setup</Button>
        </Link>
      </VStack>
    </Center>
  );
}

export function Routing() {
  // get the query parameters after /#go
  const queryString = window.location.href.split('/#go?')[1];
  const params = queryString ? new URLSearchParams(queryString) : null;
  const query = params ? params.get('q') ?? '' : '';
  const debug = params ? !!params.get('debug') : false;
  const { settings } = useAppSettings();
  const searchRoute = useSearchRoute(
    settings ?? {
      rpc: '',
      chainId: 0,
      address: '0x0',
      contract: '0x0',
    }
  );
  useEffect(() => {
    if (!settings) {
      return;
    }
    processQuery(searchRoute, query, settings.searchFallback)
      .then((url) => {
        // redirect to the processed url
        if (!debug) {
          window.location.replace(url);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [settings, query, searchRoute, debug]);

  if (!settings) {
    return <NoSettings />;
  }
  return (
    <Fade
      style={{ height: '100%' }}
      transition={{
        enter: {
          duration: 0.5,
        },
        exit: {
          duration: 0.2,
        },
      }}
      in
      unmountOnExit
    >
      <LoadingScreen summary="processing route" />
    </Fade>
  );
}
