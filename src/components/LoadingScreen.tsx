import { Center, useBoolean } from '@chakra-ui/react';
import { Loader } from './Loader';
import { useEffect } from 'react';

export function LoadingScreen({
  summary,
  appearDelayMs,
}: {
  summary?: string;
  appearDelayMs?: number;
}) {
  const [show, { on }] = useBoolean(false);
  useEffect(() => {
    setTimeout(() => {
      on();
    }, appearDelayMs ?? 0);
  }, [appearDelayMs, on]);
  return (
    <Center h="100%" w="100vw">
      <Loader helperText={summary} />
    </Center>
  );
}
