import { Route, Routes } from 'react-router-dom';
import { Box, Center, Spinner, VStack, useColorMode } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { WagmiProvider } from 'wagmi';
import { config } from './web3/config';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { queryClient } from './lib/queryClient';
import { useAppDestinations } from './hooks/useAppDestinations';

function NavRoutes() {
  const { isLoading, destinations } = useAppDestinations();
  if (isLoading) {
    return (
      <Center h="100%">
        <Spinner />
      </Center>
    );
  }
  return (
    <Routes>
      {destinations.map((destination) => (
        <Route
          key={destination.path}
          path={destination.path}
          element={destination.content}
        />
      ))}
    </Routes>
  );
}

function App(): JSX.Element {
  const { colorMode } = useColorMode();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={
            colorMode === 'dark'
              ? darkTheme({
                  accentColor: '#0f0f0f',
                  accentColorForeground: 'white',
                  borderRadius: 'large',
                  fontStack: 'rounded',
                  overlayBlur: 'small',
                })
              : undefined
          }
        >
          <VStack h="100vh" w="100vw" padding={8}>
            <Navbar />
            <Box flexGrow={1} w="100%" padding="1rem 0">
              <NavRoutes />
            </Box>
            <Footer />
          </VStack>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
