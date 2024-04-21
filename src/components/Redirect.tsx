import { Spinner } from '@chakra-ui/react';
import { useEffect } from 'react';
import { redirect } from 'react-router-dom';

export function Redirect({ to }: { to: string }) {
  useEffect(() => {
    redirect(to);
  }, [to]);
  return <Spinner />;
}
