import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { InfoIcon, SettingsIcon } from '@chakra-ui/icons';
import { TbRoute } from 'react-icons/tb';
import { Center, Divider, Heading, Link, Text, VStack } from '@chakra-ui/react';

import { Setup } from './setup/Setup';
import { Redirect } from './components/Redirect';
import { About } from './about/About';
import { Routes } from './routes/Routes';
import { AddRoute } from './new/AddRoute';
import { EditRoute } from './route/EditRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Redirect to="/rout3r" />,
  },
  {
    path: '/rout3r',
    element: <Home />,
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

function Home(): JSX.Element {
  return (
    <Center
      as="header"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      h="100%"
      fontSize="3xl"
    >
      <VStack>
        <Heading size="2xl">welcome to rout3r</Heading>
        <Text fontSize="lg">
          Open sourced web3 routes to simplify browsing.
        </Text>
        <Divider />
      </VStack>
      <VStack>
        <Link href="/rout3r/setup">
          <SettingsIcon mx="2px" />
          &nbsp; Setup
        </Link>
        <Link href="/rout3r/routes">
          <TbRoute style={{ display: 'inline' }} />
          &nbsp; Routes
        </Link>
        <Link href="/rout3r/about">
          <InfoIcon mx="2px" />
          &nbsp; About
        </Link>
      </VStack>
    </Center>
  );
}

function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
