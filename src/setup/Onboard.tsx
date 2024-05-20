import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Code,
  Flex,
  Heading,
  ListItem,
  OrderedList,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouterContract } from '../hooks/useRouterContract';
import { SetupBrowser } from './SetupBrowser';
import { BsCheckCircle, BsCheckCircleFill } from 'react-icons/bs';
import { DeployContract } from './DeployContract';
import { useCopy } from '../hooks/useCopy';
import { useCallback, useState } from 'react';
import { RouteForm } from '../components/RouteForm';
import { useCreateRoute, useGetRoutes } from '../lib/endpoints';

function OnboardingStep({
  title,
  subtitle,
  completed,
  children,
  onClick,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  completed: boolean;
  onClick?: () => void;
}>) {
  return (
    <AccordionItem
      border="solid 2px"
      borderColor={completed ? 'green.500' : undefined}
      borderRadius={10}
      marginBottom={5}
    >
      {({ isExpanded }) => {
        const highlighted = isExpanded || completed;
        return (
          <>
            <AccordionButton onClick={onClick}>
              <VStack
                w="100%"
                alignItems="flex-start"
                color={highlighted ? undefined : 'gray.500'}
                gap={0}
              >
                <Flex
                  w="100%"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Heading
                    size="md"
                    fontWeight="bold"
                    color={completed ? 'green.500' : undefined}
                  >
                    {title}
                  </Heading>
                  <Box color={completed ? 'green.500' : undefined}>
                    {completed ? <BsCheckCircleFill /> : <BsCheckCircle />}
                  </Box>
                </Flex>
                {subtitle && <Text fontSize="md">{subtitle}</Text>}
              </VStack>
            </AccordionButton>
            <AccordionPanel pb={4}>{children}</AccordionPanel>
          </>
        );
      }}
    </AccordionItem>
  );
}

export function Onboard() {
  const routerContract = useRouterContract();
  const createRouteMutation = useCreateRoute();
  const [setupBrowser, setSetupBrowser] = useState(false);
  const [createdRoute, setCreatedRoute] = useState<any>(undefined);
  const conditions = [
    true,
    routerContract.isDeployed,
    !!setupBrowser,
    !!createdRoute,
  ];
  const [index, setManualIndex] = useState(conditions.findIndex((v) => !v) - 1);
  const setIndex = useCallback(
    (index: number, override?: boolean) => () => {
      (conditions[index] || override) && setManualIndex(index);
    },
    [conditions, setManualIndex]
  );
  const copy = useCopy();
  return (
    <Accordion index={index}>
      <Heading size="md" fontWeight="400" marginBottom={5}>
        To get started, let's follow the steps below:
      </Heading>
      <OnboardingStep
        title="Step 1: Deploy the Router"
        subtitle="Deploy your router to create and manage your routes"
        completed={conditions[1]}
        onClick={setIndex(0)}
      >
        <DeployContract onComplete={setIndex(1, true)} />
      </OnboardingStep>
      <OnboardingStep
        title="Step 2: Setup your Browser"
        subtitle="Setup a search fallback and your browser"
        completed={conditions[2]}
        onClick={setIndex(1)}
      >
        <SetupBrowser />
        <Button
          onClick={() => {
            setSetupBrowser(() => {
              setIndex(2, true)();
              return true;
            });
          }}
          mt={2}
        >
          Next
        </Button>
      </OnboardingStep>
      <OnboardingStep
        title="Step 3: Create your first route"
        subtitle="Create a route and test it out!"
        completed={conditions[3]}
        onClick={setIndex(2)}
      >
        {!!createdRoute ? (
          <Heading size="md" marginBottom={3}>
            Your route has been created!
          </Heading>
        ) : (
          <RouteForm
            route={{}}
            onSubmit={async (routeData) => {
              const route = await createRouteMutation.mutateAsync(routeData);
              setCreatedRoute(route);
              setIndex(3, true)();
            }}
          />
        )}
      </OnboardingStep>
      <OnboardingStep
        title="Step 4: Try out your first route"
        subtitle="Test out your new route in the browser!"
        completed={false}
        onClick={setIndex(3)}
      >
        {createdRoute && (
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
                  <Code cursor="pointer" onClick={copy(createdRoute.command)}>
                    {createdRoute.command}
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
                  <Code cursor="pointer" onClick={copy(createdRoute.command)}>
                    {createdRoute.command}
                  </Code>{' '}
                  into your browser address bar! And go!
                </Text>
              </ListItem>
            </OrderedList>
          </>
        )}
      </OnboardingStep>
    </Accordion>
  );
}
