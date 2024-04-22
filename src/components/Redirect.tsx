import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@chakra-ui/react';

export function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [to]);
  return <Spinner />;
}
