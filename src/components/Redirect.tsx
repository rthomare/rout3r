import { useEffect } from 'react';
import { redirect } from 'react-router-dom';

import { Spinner } from '@chakra-ui/react';

export function Redirect({ to }: { to: string }) {
  useEffect(() => {
    redirect(to);
  }, [to]);
  return <Spinner />;
}
