import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Box, ComponentWithAs, Link, VStack } from '@chakra-ui/react';
import { Setup } from './setup/Setup';
import { Redirect } from './components/Redirect';
import { About } from './about/About';
import { Routes } from './routes/Routes';
import { AddRoute } from './add/AddRoute';
import { EditRoute } from './route/EditRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Create a client
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Redirect to="/rout3r/routes" />,
  },
  {
    path: '/rout3r',
    element: <Routes />,
  },
  {
    path: '/rout3r/setup',
    element: <Setup />,
  },
  {
    path: '/rout3r/about',
    element: <About />,
  },
  {
    path: '/rout3r/routes',
    element: <Routes />,
  },
  {
    path: '/rout3r/routes/new',
    element: <AddRoute />,
  },
  {
    path: '/rout3r/route/:command',
    element: <EditRoute />,
  },
]);

function HomeLink({
  to,
  Icon,
  label,
}: {
  to: string;
  Icon: ComponentWithAs<'svg', any>;
  label: string;
}): JSX.Element {
  return (
    <Link
      href={to}
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap={2}
      fontSize="2xl"
    >
      <Icon mx="2px" />
      <Box>{label}</Box>
    </Link>
  );
}

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <VStack h="100vh" w="100vw" padding={8}>
        <Navbar />
        <Box flexGrow={1} w="100%" padding="1rem 0">
          <RouterProvider router={router} />
        </Box>
        <Footer />
      </VStack>
    </QueryClientProvider>
  );
}

export default App;
