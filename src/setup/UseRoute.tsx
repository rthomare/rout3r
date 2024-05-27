import {
  Box,
  Code,
  Heading,
  ListItem,
  OrderedList,
  Text,
} from '@chakra-ui/react';
import { Route } from '../lib/types';
import { useCopy } from '../hooks/useCopy';

export function UseRoute({ route }: { route: Route }) {
  const copy = useCopy();
  return (
    <>
      <Heading marginBottom={1} fontWeight={600} size="sm">
        If you made rout3r your default (in step 2):
      </Heading>
      <OrderedList>
        <ListItem>
          <Text>
            Try it out by{' '}
            <Box
              as="span"
              cursor="pointer"
              textDecor="underline"
              onClick={() => window.open('')}
            >
              creating a new tab.
            </Box>
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            Then type in
            <Code cursor="pointer" onClick={copy(route.command)}>
              {route.command}
            </Code>{' '}
            into your browser address bar! And go!
          </Text>
        </ListItem>
      </OrderedList>
      <Heading marginTop={6} marginBottom={1} fontWeight={600} size="sm">
        If you made rout3r is NOT your default search engine (in step 2):
      </Heading>
      <OrderedList>
        <ListItem>
          <Text>
            Try it out by{' '}
            <Box
              as="span"
              cursor="pointer"
              textDecor="underline"
              onClick={() => window.open('')}
            >
              creating a new tab.
            </Box>
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            Select rout3r as the search by typing in
            <Code cursor="pointer" onClick={copy('r')}>
              r
            </Code>{' '}
            into your browser address bar and hitting tab!
          </Text>
        </ListItem>
        <ListItem>
          <Text>
            Then type in
            <Code cursor="pointer" onClick={copy(route.command)}>
              {route.command}
            </Code>{' '}
            into your browser address bar! And go!
          </Text>
        </ListItem>
      </OrderedList>
    </>
  );
}
