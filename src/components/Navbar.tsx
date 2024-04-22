import { MoonIcon, StarIcon, SunIcon } from '@chakra-ui/icons';
import { Box, Button, HStack, Switch, useColorMode } from '@chakra-ui/react';
import { BsGithub } from 'react-icons/bs';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack justifyContent="space-between" w="100%">
      <HStack fontSize="lg" gap={4}>
        <Link to="/routes">Routes</Link>
        <Link to="/setup">Setup</Link>
        <Link to="/about">About</Link>
      </HStack>
      <HStack fontSize="lg" gap={0}>
        <Link
          to="https://github.com/rthomare"
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
          to="https://github.com/rthomare/rout3r"
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
        <Box position="relative">
          <Switch
            size="lg"
            isChecked={colorMode === 'light'}
            onChange={toggleColorMode}
            aria-label="Toggle color mode"
            colorScheme={colorMode === 'light' ? 'gray' : 'whiteAlpha'}
          />
          <MoonIcon
            fontSize="md"
            position="absolute"
            top="8px"
            left="5px"
            color="white"
            pointerEvents={'none'}
          />
          <SunIcon
            fontSize="md"
            position="absolute"
            top="8px"
            right="5px"
            color="white"
            pointerEvents={'none'}
          />
        </Box>
      </HStack>
    </HStack>
  );
}
