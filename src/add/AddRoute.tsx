import { useNavigate } from 'react-router-dom';
import { RouteForm } from '../components/RouteForm';
import { useCreateRoute } from '../lib/endpoints';
import { PageHeader } from '../components/PageHeader';

export function AddRoute(): JSX.Element {
  const navigate = useNavigate();
  const createRouteMutation = useCreateRoute();
  return (
    <>
      <PageHeader>Add Route</PageHeader>
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
