import { processQuery } from './lib/engine';
import { useEffect, useState } from 'react';
import { useSearchRoute } from './lib/endpoints';
import { Button, Center, Fade, Heading, Link, VStack } from '@chakra-ui/react';
import { useAppSettings } from './hooks/useAppSettings';
import { Loader } from './components/Loader';
import { LoadingScreen } from './components/LoadingScreen';

export function NoSettings() {
  return (
    <Center w="100vw" h="100vh">
      <VStack>
        <Heading>No settings were found for your Router</Heading>
        <Heading size="md">Try going through the setup process again</Heading>
        <Link href="/#setup">
          <Button>Go to Setup</Button>
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
  if (!settings) {
    return <NoSettings />;
  }

  const searchRoute = useSearchRoute(settings);

  useEffect(() => {
    if (!settings) {
      return;
    }
    processQuery(searchRoute, query, settings.searchFallback)
      .then((url) => {
        // redirect to the processed url
        !debug && window.location.replace(url);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [settings]);

  return (
    <Fade
      transition={{
        enter: {
          duration: 0.5,
        },
        exit: {
          duration: 0.2,
        },
      }}
      in={true}
      unmountOnExit
    >
      <LoadingScreen summary="Processing your Route" />
    </Fade>
  );
}
