import { Box, Heading, Text, VStack } from '@chakra-ui/react';

export function About(): JSX.Element {
  return (
    <VStack alignItems="start" gap={5}>
      <Heading>About rout3r</Heading>
      <Box>
        <Heading size="md">What is rout3r?</Heading>
        <Text>
          rout3r is a simple routing application that allows you turn your
          browser into a command line interface to navigate to different
          websites.
        </Text>
      </Box>
      <Box>
        <Heading size="md">What can I do with rout3r?</Heading>
        <Text>
          You can create, edit, and delete routes. You can also view a list of
          all routes.
        </Text>
      </Box>
      <Box>
        <Heading size="md">How do I get started?</Heading>
        <Text>
          To get started, click on the &quot;Setup&quot; link and follow the
          instructions to add it to your browser. Then click on the
          &quot;Routes&quot; link to view a list of all routes. From there, you
          can click on the &quot;Add a Route&quot; button to create a new route.
        </Text>
      </Box>
    </VStack>
  );
}
