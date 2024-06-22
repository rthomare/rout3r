import { useMemo } from 'react';

import { Heading, VStack } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { About } from '../about/About';
import { AddRoute } from '../add/AddRoute';
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
                <Heading size="lg">Welcome to router!</Heading>
                <ConnectButton label="Connect Your Wallet" />
              </VStack>
            ),
            path: '/',
            name: 'Routes',
          },
          {
            content: <About />,
            path: '/about',
            name: 'About',
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
            name: 'Routes',
          },
          {
            content: <About />,
            path: '/about',
            name: 'About',
          },
          {
            content: <Debug />,
            path: '/debug',
            name: 'Debug',
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
            name: 'Routes',
            shouldHideNav: false,
          },
          {
            content: <Redirect to="/routes" />,
            path: '/',
            name: 'Root',
            shouldHideNav: true,
          },
          {
            content: <Settings />,
            path: '/settings',
            name: 'Settings',
          },
          {
            content: <Onboard />,
            path: '/setup',
            name: 'Setup',
          },
          {
            content: <About />,
            path: '/about',
            name: 'About',
          },
          {
            content: <AddRoute />,
            path: '/routes/new',
            name: 'New Route',
            shouldHideNav: true,
          },
          {
            content: <EditRoute />,
            path: '/routes/edit/:command',
            name: 'Edit Route',
            shouldHideNav: true,
          },
          {
            content: <Debug />,
            path: '/debug',
            name: 'Debug',
            shouldHideNav: true,
          },
          {
            content: <Routing />,
            path: '/go',
            name: 'Go',
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
          name: 'Root',
          shouldHideNav: true,
        },
        {
          content: <Onboard />,
          path: '/setup',
          name: 'Setup',
        },
        {
          content: <About />,
          path: '/about',
          name: 'About',
        },
      ],
      basename: 'rout3r',
    };
  }, [appState]);
}
