import { StarIcon } from '@chakra-ui/icons';
import { Button, HStack, Link } from '@chakra-ui/react';
import { BsGithub } from 'react-icons/bs';

export function Navbar() {
  return (
    <HStack justifyContent="space-between" w="100%">
      <HStack fontSize="lg" gap={4}>
        <a href="/rout3r/routes">Routes</a>
        <a href="/rout3r/setup">Setup</a>
        <a href="/rout3r/about">About</a>
      </HStack>
      <HStack fontSize="lg" gap={0}>
        <Link
          href="https://github.com/rthomare"
          aria-label="Follow @rthomare on GitHub"
          target={'_blank'}
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
          href="https://github.com/rthomare/rout3r"
          aria-label="Star rthomare/rout3r on GitHub"
          target={'_blank'}
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
      </HStack>
    </HStack>
  );
}
