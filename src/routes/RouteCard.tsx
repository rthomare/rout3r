import { Box, Code, HStack, Image } from '@chakra-ui/react';
import { Route } from '../lib/types';
import { useNavigate } from 'react-router-dom';

export function RouteCard({ route }: { route: Route }) {
  const navigate = useNavigate();
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${route.url}`;
  return (
    <HStack
      onClick={() => {
        navigate(`/routes/edit/${route.command}`);
      }}
      cursor="pointer"
      borderRadius="10px"
      position="relative"
      border="1px sold #000000AA"
      backgroundImage={`url(${faviconUrl})`}
      backgroundSize="400%"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
      clipPath="inset(0)"
      transition="all 0.3s"
      alignItems="center"
      justifyContent="center"
      padding="16px"
      w="100px"
      h="75px"
    >
      <Box
        borderRadius="10px"
        position="absolute"
        backgroundColor="#000000DD"
        backdropFilter="blur(300px)"
        top="3px"
        left="3px"
        w="calc(100% - 6px)"
        h="calc(100% - 6px)"
        zIndex={-1}
      />
      <Image
        src={faviconUrl}
        objectFit="contain"
        alt="command logo"
        h="24px"
        w="24px"
        borderRadius="50%"
      />
      <Code fontWeight="bold" background="#00000000" size="sm">
        {route.command}
      </Code>
    </HStack>
  );
}
