import { BsGithub } from 'react-icons/bs';
import { Link } from 'react-router-dom';

import { StarIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';

import { PageHeader } from '../components/PageHeader';

export function About(): JSX.Element {
  return (
    <VStack alignItems="start" gap={5}>
      <PageHeader>About rout3r</PageHeader>
      <Flex
        style={{
          marginTop: 0,
        }}
        gap={2}
      >
        <Link
          to="https://github.com/rthomare"
          aria-label="Follow @rthomare on GitHub"
          target="_blank"
        >
          <Button
            size="xs"
            leftIcon={<BsGithub />}
            border="1px solid"
            _hover={{
              bg: 'gray.600',
            }}
            transition="all 0.2s"
          >
            Follow @rthomare
          </Button>
        </Link>
        <Link
          to="https://github.com/rthomare/rout3r"
          aria-label="Star rthomare/rout3r on GitHub"
          target="_blank"
        >
          <Button
            size="xs"
            leftIcon={<StarIcon />}
            border="1px solid"
            _hover={{
              bg: 'gray.600',
            }}
            transition="all 0.2s"
          >
            Star
          </Button>
        </Link>
      </Flex>
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
