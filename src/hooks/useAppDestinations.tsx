import { Heading, VStack } from '@chakra-ui/react';
import { useAppState } from './useAppState';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { About } from '../about/About';
import { Onboard } from '../setup/Onboard';
import { Redirect } from '../components/Redirect';
import { AddRoute } from '../add/AddRoute';
import { EditRoute } from '../route/EditRoute';
import { Routes as Rout3s } from '../routes/Routes';
import { useMemo } from 'react';

export type AppDestinations = {
  content: React.ReactElement;
  path: string;
  name: string;
};

export function useAppDestinations() {
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
            name: 'Home',
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
            name: 'Home',
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

    if (appState.isContractDeployed) {
      return {
        isLoading: false,
        destinations: [
          {
            content: <Redirect to="/routes" />,
            path: '/',
            name: 'Home',
          },
          {
            content: <About />,
            path: '/about',
            name: 'About',
          },
          {
            content: <Onboard />,
            path: '/setup',
            name: 'Setup',
          },
          {
            content: <Rout3s />,
            path: '/routes',
            name: 'Routes',
          },
          {
            content: <AddRoute />,
            path: '/routes/new',
            name: 'New Route',
          },
          {
            content: <EditRoute />,
            path: '/route/:command',
            name: 'Edit Route',
          },
        ],
        basename: 'rout3r',
      };
    }

    return {
      isLoading: false,
      destinations: [
        {
          content: <Onboard />,
          path: '/',
          name: 'Home',
        },
        {
          content: <About />,
          path: '/setup',
          name: 'About',
        },
      ],
    };
  }, [appState]);
}