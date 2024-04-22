import { Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
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
          navigate(`/rout3r/route/${route.command}`);
        }}
      />
    </>
  );
}
