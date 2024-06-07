import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouterContract } from '../hooks/useRouterContract';
import { SetupBrowser } from './SetupBrowser';
import { BsCheckCircle, BsCheckCircleFill } from 'react-icons/bs';
import { DeployContract } from './DeployContract';
import { useCallback, useState } from 'react';
import { UseRoute } from './UseRoute';
import { Route } from '../lib/types';
import { SetupRoute } from './SetupRoute';

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
  const [setupBrowser, setSetupBrowser] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>();
  const conditions = [
    true,
    routerContract.isDeployed,
    !!setupBrowser,
    !!selectedRoute,
  ];
  const [index, setManualIndex] = useState(conditions.findIndex((v) => !v) - 1);
  const setIndex = useCallback(
    (index: number, override?: boolean) => () => {
      (conditions[index] || override) && setManualIndex(index);
    },
    [conditions, setManualIndex]
  );

  const didSelectRoute = useCallback((route?: Route) => {
    if (route) {
      setSelectedRoute(route);
      setIndex(3, true)();
    } else {
      setSelectedRoute(undefined);
      setIndex(2)();
    }
  }, []);
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
        <SetupBrowser
          onSetup={() => {
            setSetupBrowser(() => {
              setIndex(2, true)();
              return true;
            });
          }}
        />
      </OnboardingStep>
      <OnboardingStep
        title="Step 3: Create your first route"
        subtitle="Create a route and test it out!"
        completed={conditions[3]}
        onClick={setIndex(2)}
      >
        {routerContract.isDeployed && (
          <SetupRoute
            selectedRoute={selectedRoute}
            generatedRoute={didSelectRoute}
          />
        )}
      </OnboardingStep>
      <OnboardingStep
        title="Step 4: Try out your first route"
        subtitle="Test out your new route in the browser!"
        completed={false}
        onClick={setIndex(3)}
      >
        {selectedRoute ? <UseRoute route={selectedRoute} /> : <Spinner />}
      </OnboardingStep>
    </Accordion>
  );
}
