import {
  Box,
  Code,
  Fade,
  HStack,
  Heading,
  IconButton,
  Image,
  ScaleFade,
  Stack,
  Text,
  VStack,
  useBoolean,
} from '@chakra-ui/react';
import { Route } from '../lib/types';
import { useNavigate } from 'react-router-dom';
import { BsPencilFill } from 'react-icons/bs';

function RouteCardContent({
  route,
  expanded,
}: {
  route: Route;
  expanded: boolean;
}) {
  return (
    <ScaleFade
      in={expanded}
      initialScale={0.9}
      unmountOnExit={true}
      style={{
        width: '100%',
      }}
    >
      <VStack alignItems="start" gap={2}>
        <Box w="100%">
          <Heading size="sm" fontWeight="bold">
            {route.name}
          </Heading>
          <Text
            fontSize="xs"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
            w="100%"
          >
            <i>{route.url}</i>
          </Text>
        </Box>
        <Text fontSize="xs">{route.description}</Text>
        <Code
          padding="6px"
          borderRadius="5px"
          fontWeight="bold"
          background="#00000000"
          size="sm"
          border="1px solid white"
          w="100%"
        >
          Command: {route.command}
        </Code>
      </VStack>
    </ScaleFade>
  );
}

function RouteHeader({ route, iconUrl }: { route: Route; iconUrl: string }) {
  return (
    <HStack alignItems="center">
      <Image
        src={iconUrl}
        objectFit="fill"
        alt="command logo"
        aspectRatio={1}
        borderRadius="50%"
        height="25px"
      />
      <Code background="#00000000" fontWeight="bold" size="sm">
        {route.command}
      </Code>
    </HStack>
  );
}

export function RouteCard({ route }: { route: Route }) {
  const navigate = useNavigate();
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${route.url}`;
  const [expanded, { toggle }] = useBoolean(false);
  const dim = {
    w: expanded ? '300px' : '105px',
    h: expanded ? '200px' : '44px',
  };
  return (
    <Stack
      onClick={toggle}
      cursor="pointer"
      position="relative"
      clipPath="inset(0 0 0 0 round 8px)"
      borderRadius="8px"
      backgroundImage={`url(${faviconUrl})`}
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
      backgroundSize="cover"
      alignItems="start"
      justifyContent="start"
      padding="10px"
      borderColor="ActiveBorder"
      transition="all 0.3s"
      h={dim.h}
      w={dim.w}
    >
      <Box
        position="absolute"
        w="100%"
        h="100%"
        top={0}
        left={0}
        zIndex={-2}
        backdropFilter="blur(50px)"
        transition="all 0.3s"
      />
      <Box
        position="absolute"
        opacity={0.5}
        w="100%"
        h="100%"
        top={0}
        left={0}
        zIndex={-1}
        background="Background"
      />
      <HStack alignItems="center" justifyContent="space-between" w="100%">
        <RouteHeader route={route} iconUrl={faviconUrl} />
        <Fade in={expanded} unmountOnExit={true}>
          <IconButton
            h="100%"
            icon={<BsPencilFill />}
            _hover={{ background: 'transparent', color: 'Highlight' }}
            aria-label="edit route"
            background="clear"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/routes/edit/${route.command}`);
            }}
          />
        </Fade>
      </HStack>
      <RouteCardContent route={route} expanded={expanded} />
    </Stack>
  );
}
