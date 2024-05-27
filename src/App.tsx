import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { Box, Center, Spinner, VStack, useColorMode } from '@chakra-ui/react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useAppDestinations } from './hooks/useAppDestinations';
import { OnchainProvider } from './hooks/useOnchain';
import { useAccountEffect } from 'wagmi';

function Content() {
  const appDestinations = useAppDestinations();
  const navigate = useNavigate();
  useAccountEffect({
    onDisconnect() {
      navigate('/');
    },
  });
  return (
    <VStack h="100vh" w="100vw" padding={8}>
      <Navbar {...appDestinations} />
      <Box flexGrow={1} w="100%" padding="1rem 0">
        {appDestinations.isLoading ? (
          <Center h="100%">
            <Spinner />
          </Center>
        ) : (
          <Routes>
            {appDestinations.destinations.map((destination) => (
              <Route
                key={destination.path}
                path={destination.path}
                element={destination.content}
              />
            ))}
          </Routes>
        )}
      </Box>
      <Footer />
    </VStack>
  );
}

function App(): JSX.Element {
  const { colorMode } = useColorMode();

  return (
    <HashRouter>
      <OnchainProvider>
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
          <Content />
        </RainbowKitProvider>
      </OnchainProvider>
    </HashRouter>
  );
}

export default App;
