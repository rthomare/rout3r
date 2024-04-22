import { HStack } from '@chakra-ui/react';
import GitHubButton from 'react-github-btn';

export function Navbar() {
  return (
    <HStack justifyContent="space-between" w="100%">
      <HStack fontSize="lg" gap={4}>
        <a href="/rout3r/routes">Routes</a>
        <a href="/rout3r/setup">Setup</a>
        <a href="/rout3r/about">About</a>
      </HStack>
      <HStack fontSize="lg" gap={1}>
        <GitHubButton
          href="https://github.com/rthomare"
          data-color-scheme="no-preference: light; light: light; dark: dark;"
          data-size="large"
        >
          Follow @rthomare
        </GitHubButton>
        <GitHubButton
          href="https://github.com/rthomare/rout3r"
          data-icon="star"
          data-color-scheme="no-preference: light; light: light; dark: dark;"
          data-size="large"
        >
          Star
        </GitHubButton>
      </HStack>
    </HStack>
  );
}
