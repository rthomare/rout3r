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
        onSubmit={async (routeData) => {
          const route = await createRouteMutation.mutateAsync(routeData);
          navigate(`/routes/edit/${route.command}`);
        }}
      />
    </>
  );
}
