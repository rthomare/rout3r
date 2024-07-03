import {
  Box,
  Code,
  Divider,
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
import { Route, RouteType } from '../lib/types';
import { useNavigate } from 'react-router-dom';
import { BsPencilFill } from 'react-icons/bs';

function RouteCardOverlay({
  iconUrl,
  expanded,
}: {
  iconUrl?: string;
  expanded?: boolean;
}) {
  return (
    <Box
      position="absolute"
      clipPath="inset(0 0 0 0 round 8px)"
      w="100%"
      h="100%"
      top={0}
      left={0}
      zIndex={-1}
    >
      <Box
        position="absolute"
        w="100%"
        h="100%"
        top={0}
        left={0}
        zIndex={-3}
        clipPath="inset(0 0 0 0 round 8px)"
        opacity={expanded ? 0.25 : 0}
        backgroundImage={`url(${iconUrl})`}
        backgroundRepeat="no-repeat"
        backgroundPosition="center"
        backgroundSize="200%"
        transition="opacity 0.3s"
      />
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
        opacity={expanded ? 0 : 0.1}
        w="100%"
        h="100%"
        top={0}
        left={0}
        zIndex={-1}
        clipPath="inset(0 0 0 0 round 8px)"
        background={expanded ? 'Background' : 'ButtonText'}
        transition="all 0.3s"
      />
    </Box>
  );
}

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
          <Heading size="sm">
            {route.name}{' '}
            {route.routeType === RouteType.RESERVED ? '(reserved)' : ''}
          </Heading>
          <Text
            fontSize="xs"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
            w="100%"
          >
            <i>{route.url}</i>{' '}
            {route.subRoutes.length > 0
              ? `(${route.subRoutes.length} subroutes)`
              : ''}
          </Text>
        </Box>
        <Divider />
        <Box>
          <Text fontSize="xs">description</Text>
          <Text fontSize="xs">{route.description}</Text>
        </Box>
      </VStack>
    </ScaleFade>
  );
}

function RouteHeader({
  route,
  iconUrl,
  expanded,
}: {
  route: Route;
  iconUrl: string;
  expanded: boolean;
}) {
  const navigate = useNavigate();
  return (
    <HStack alignItems="center" justifyContent="space-between" w="100%">
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
  );
}

export function RouteCard({ route }: { route: Route }) {
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
      padding="10px"
      transition="all 0.3s"
      h={dim.h}
      w={dim.w}
      borderRadius="8px"
      _hover={{
        transform: expanded ? undefined : 'scale(1.05)',
        border: expanded ? undefined : '.5px solid gray',
      }}
    >
      <RouteCardOverlay iconUrl={faviconUrl} expanded={expanded} />
      <RouteHeader route={route} iconUrl={faviconUrl} expanded={expanded} />
      <RouteCardContent route={route} expanded={expanded} />
    </Stack>
  );
}
