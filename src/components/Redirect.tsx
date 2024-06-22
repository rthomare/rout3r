import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoadingScreen } from './LoadingScreen';

export function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [to, navigate]);
  return <LoadingScreen summary="Loading destiantion" />;
}
