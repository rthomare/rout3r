import { useNavigate } from 'react-router-dom';

import { Heading } from '@chakra-ui/react';

import { RouteForm } from '../components/RouteForm';
import { useCreateRoute } from '../lib/endpoints';

export function AddRoute(): JSX.Element {
  const navigate = useNavigate();
  const createRouteMutation = useCreateRoute();
  return (
    <>
      <Heading size="lg" marginBottom={3}>
        Add Route
      </Heading>
      <RouteForm
        route={{}}
        onSubmit={async (route) => {
          createRouteMutation.mutateAsync(route);
          navigate(`/route/${route.command}`);
        }}
      />
    </>
  );
}
