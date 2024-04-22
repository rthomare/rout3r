import { Routes, Route, HashRouter } from 'react-router-dom';
import { Box, VStack } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { About } from './about/About';
import { AddRoute } from './add/AddRoute';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { EditRoute } from './route/EditRoute';
import { Routes as Rout3s } from './routes/Routes';
import { Setup } from './setup/Setup';
import { Redirect } from './components/Redirect';

// Create a client
const queryClient = new QueryClient();

function App(): JSX.Element {
  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <VStack h="100vh" w="100vw" padding={8}>
          <Navbar />
          <Box flexGrow={1} w="100%" padding="1rem 0">
            <Routes>
              <Route path="/" element={<Redirect to="/routes" />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/about" element={<About />} />
              <Route path="/routes" element={<Rout3s />} />
              <Route path="/routes/new" element={<AddRoute />} />
              <Route path="/route/:command" element={<EditRoute />} />
            </Routes>
          </Box>
          <Footer />
        </VStack>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
