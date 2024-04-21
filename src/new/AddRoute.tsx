import { Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { RouteForm } from '../components/RouteForm';
import { createRouteDB } from '../lib/database';

export function AddRoute(): JSX.Element {
  const navigate = useNavigate();
  return (
    <>
      <Heading size="lg">Add Route</Heading>
      <RouteForm
        route={{}}
        onSubmit={async (route) => {
          // Add route to database
          const db = createRouteDB();
          await db.addRoute(route);
          navigate(`/rout3r/route/${route.command}`);
        }}
      />
    </>
  );
}
