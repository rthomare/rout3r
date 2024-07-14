import { useCallback, useMemo, useState } from 'react';
import { BsCheckCircle, BsCheckCircleFill } from 'react-icons/bs';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';

import { PageHeader } from '../components/PageHeader';
import { useRouterContract } from '../hooks/useRouterContract';
import { Route } from '../lib/types';

import { DeployContract } from './DeployContract';
import { SetupBrowser } from './SetupBrowser';
import { SetupRoute } from './SetupRoute';
import { UseRoute } from './UseRoute';

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
      borderRadius={8}
      marginBottom={5}
    >
      {({ isExpanded }) => {
        const highlighted = isExpanded || completed;
        return (
          <>
            <AccordionButton
              onClick={onClick}
              borderBottomRadius={isExpanded ? 0 : 10}
              borderTopRadius={10}
            >
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
                    fontWeight={highlighted ? 'semibold' : 'normal'}
                    color={completed ? 'green.500' : undefined}
                  >
                    {title}
                  </Heading>
                  <Box color={completed ? 'green.500' : undefined}>
                    {completed ? <BsCheckCircleFill /> : <BsCheckCircle />}
                  </Box>
                </Flex>
                {subtitle && (
                  <Text textAlign="start" fontSize="md">
                    {subtitle}
                  </Text>
                )}
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
  const conditions = useMemo(
    () => [true, routerContract.isDeployed, !!setupBrowser, !!selectedRoute],
    [routerContract.isDeployed, setupBrowser, selectedRoute]
  );
  const [index, setManualIndex] = useState(conditions.findIndex((v) => !v) - 1);
  const setIndex = useCallback(
    (conditionIndex: number, override?: boolean) =>
      (conditions[conditionIndex] || override) &&
      setManualIndex(conditionIndex),
    [conditions, setManualIndex]
  );

  const didSelectRoute = useCallback(
    (route?: Route) => {
      if (route) {
        setSelectedRoute(route);
        setIndex(3, true);
      } else {
        setSelectedRoute(undefined);
        setIndex(2);
      }
    },
    [setIndex, setSelectedRoute]
  );
  return (
    <>
      <Accordion index={index}>
        <OnboardingStep
          title="deploy"
          subtitle="deploy your router to create and manage your routes"
          completed={conditions[1]}
          onClick={() => setIndex(0)}
        >
          <DeployContract onComplete={() => setIndex(1, true)} />
        </OnboardingStep>
        <OnboardingStep
          title="fallback"
          subtitle="setup a search fallback and your browser"
          completed={conditions[2]}
          onClick={() => setIndex(1)}
        >
          <SetupBrowser
            onSetup={() => {
              setSetupBrowser(() => {
                setIndex(2, true);
                return true;
              });
            }}
          />
        </OnboardingStep>
        <OnboardingStep
          title="your first route"
          subtitle="create a route and test it out!"
          completed={conditions[3]}
          onClick={() => setIndex(2)}
        >
          {routerContract.isDeployed && (
            <SetupRoute
              selectedRoute={selectedRoute}
              generatedRoute={didSelectRoute}
            />
          )}
        </OnboardingStep>
        <OnboardingStep
          title="try it out"
          subtitle="test out your new route in the browser!"
          completed={false}
          onClick={() => setIndex(3)}
        >
          {selectedRoute ? <UseRoute route={selectedRoute} /> : <Spinner />}
        </OnboardingStep>
      </Accordion>
    </>
  );
}
