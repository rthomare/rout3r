import { processQuery, retrieveAppSettings } from './lib/engine';
import { useEffect } from 'react';
import { useSearchRoute } from './lib/endpoints';
import { LoadingScreen } from './components/LoadingScreen';
import { Button, Center, Heading, Link, VStack } from '@chakra-ui/react';

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
  const appSettings = retrieveAppSettings();
  if (!appSettings) {
    return <NoSettings />;
  }

  const searchRoute = useSearchRoute(appSettings);
  useEffect(() => {
    if (!appSettings) {
      return;
    }
    processQuery(searchRoute, query, appSettings.searchFallback)
      .then((url) => {
        // redirect to the processed url
        !debug && window.location.replace(url);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [appSettings]);

  return (
    <LoadingScreen
      summary={debug ? 'Debug Processesing Query' : 'Processing Query'}
    />
  );
}
