import { Routes, Route, HashRouter } from 'react-router-dom';
import { Box, Center, Spinner, VStack, useColorMode } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { About } from './about/About';
import { AddRoute } from './add/AddRoute';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { EditRoute } from './route/EditRoute';
import { Routes as Rout3s } from './routes/Routes';
import { Setup } from './setup/Setup';
import { Redirect } from './components/Redirect';
import { WagmiProvider, useConnectorClient } from 'wagmi';
import { config } from './web3/config';
import {
  ConnectButton,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Create a client
const queryClient = new QueryClient();

function NavRoutes() {
  const result = useConnectorClient();
  if (result.isLoading) {
    return (
      <Center h="100%">
        <Spinner size="xl" />
      </Center>
    );
  }

  return result.status === 'success' ? (
    <Routes>
      <Route path="/" element={<Redirect to="/routes" />} />
      <Route path="/about" element={<About />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/routes" element={<Rout3s />} />
      <Route path="/routes/new" element={<AddRoute />} />
      <Route path="/route/:command" element={<EditRoute />} />
    </Routes>
  ) : (
    <Routes>
      <Route
        path="/*"
        element={
          <Center h="100%">
            <VStack gap={4}>
              <ConnectButton label="Connect Your Wallet" />
            </VStack>
          </Center>
        }
      />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

function App(): JSX.Element {
  const { colorMode } = useColorMode();

  return (
    <HashRouter>
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
    </HashRouter>
  );
}

export default App;
