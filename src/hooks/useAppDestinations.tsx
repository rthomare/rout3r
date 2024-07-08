import { useMemo } from 'react';

import { Heading, VStack } from '@chakra-ui/react';

import { About } from '../about/About';
import { AddRoute } from '../add/AddRoute';
import { ConnectButton } from '../components/ConnectButton';
import { Redirect } from '../components/Redirect';
import { Debug } from '../debug/Debug';
import { EditRoute } from '../route/EditRoute';
import { Routes as Rout3s } from '../routes/Routes';
import { Routing } from '../routing/Routing';
import { Settings } from '../settings/Settings';
import { Onboard } from '../setup/Onboard';

import { useAppState } from './useAppState';

type AppDestinations = {
  content: React.ReactElement;
  path: string;
  name: string;
  shouldHideNav?: boolean;
};

/*
 * The type depicting the different destinations in the application
 * isLoading: boolean - whether the destinations are loading
 * destinations: AppDestinations[] - the different destinations
 * basename: string - the base path of the application
 */
export type AppDestinationsResponse = {
  isLoading: boolean;
  destinations: AppDestinations[];
  basename: string;
};

/*
 * Hook to get the different destinations in the application
 * @returns the different destinations in the application based on the application state
 */
export function useAppDestinations(): AppDestinationsResponse {
  const appState = useAppState();
  return useMemo(() => {
    if (appState.isLoading) {
      return {
        isLoading: true,
        destinations: [],
        basename: 'rout3r',
      };
    }

    if (!appState.isWalletConnected) {
      return {
        isLoading: false,
        destinations: [
          {
            content: (
              <VStack alignItems="center" justifyContent="center" h="100%">
                <ConnectButton />
              </VStack>
            ),
            path: '/',
            name: 'routes',
            shouldHideNav: true,
          },
          {
            content: <About />,
            path: '/about',
            name: 'about',
            shouldHideNav: true,
          },
          {
            content: <Redirect to="/" />,
            path: '*',
            name: 'catchall',
            shouldHideNav: true,
          },
        ],
        basename: 'rout3r',
      };
    }

    if (appState.error) {
      return {
        isLoading: false,
        destinations: [
          {
            content: (
              <VStack alignItems="center" h="100%">
                <Heading size="lg" colorScheme="error">
                  There was an error!
                </Heading>
                <Heading size="md">{`${appState.error}`}</Heading>
                <Heading size="md">Please refresh or try again later.</Heading>
              </VStack>
            ),
            path: '/',
            name: 'routes',
          },
          {
            content: <About />,
            path: '/about',
            name: 'about',
          },
          {
            content: <Debug />,
            path: '/debug',
            name: 'debug',
            shouldHideNav: true,
          },
          {
            content: <Redirect to="/" />,
            path: '*',
            name: 'catchall',
            shouldHideNav: true,
          },
        ],
        basename: 'rout3r',
      };
    }

    if (appState.isContractDeployed) {
      return {
        isLoading: false,
        destinations: [
          {
            content: <Rout3s />,
            path: '/routes',
            name: 'routes',
            shouldHideNav: false,
          },
          {
            content: <Redirect to="/routes" />,
            path: '/',
            name: 'root',
            shouldHideNav: true,
          },
          {
            content: <Settings />,
            path: '/settings',
            name: 'settings',
            shouldHideNav: true,
          },
          {
            content: <Onboard />,
            path: '/setup',
            name: 'setup',
          },
          {
            content: <About />,
            path: '/about',
            name: 'about',
            shouldHideNav: true,
          },
          {
            content: <AddRoute />,
            path: '/routes/new',
            name: 'add route',
            shouldHideNav: true,
          },
          {
            content: <EditRoute />,
            path: '/routes/edit/:command',
            name: 'edit route',
            shouldHideNav: true,
          },
          {
            content: <Debug />,
            path: '/debug',
            name: 'debug',
            shouldHideNav: true,
          },
          {
            content: <Routing />,
            path: '/go',
            name: 'go',
            shouldHideNav: true,
          },
          {
            content: <Redirect to="/" />,
            path: '*',
            name: 'catchall',
            shouldHideNav: true,
          },
        ],
        basename: 'rout3r',
      };
    }

    return {
      isLoading: false,
      destinations: [
        {
          content: <Redirect to="/setup" />,
          path: '/',
          name: 'root',
          shouldHideNav: true,
        },
        {
          content: <Onboard />,
          path: '/setup',
          name: 'setup',
        },
        {
          content: <About />,
          path: '/about',
          name: 'about',
          shouldHideNav: true,
        },
        {
          content: <Redirect to="/" />,
          path: '*',
          name: 'catchall',
          shouldHideNav: true,
        },
      ],
      basename: 'rout3r',
    };
  }, [appState]);
}
