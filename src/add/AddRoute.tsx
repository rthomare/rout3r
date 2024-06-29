import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../components/PageHeader';
import { RouteForm } from '../components/RouteForm';
import { useCreateRoute } from '../lib/endpoints';

export function AddRoute(): JSX.Element {
  const navigate = useNavigate();
  const createRouteMutation = useCreateRoute();
  return (
    <>
      <PageHeader>add route</PageHeader>
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
