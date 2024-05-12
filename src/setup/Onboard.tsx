import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouterContract } from '../hooks/useRouterContract';
import { SetupBrowser } from './SetupBrowser';
import { BsCheckCircle, BsCheckCircleFill } from 'react-icons/bs';
import { DeployContract } from './DeployContract';

function OnboardingStep({
  title,
  subtitle,
  completed,
  children,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  completed: boolean;
}>) {
  return (
    <AccordionItem border="solid 1px" borderRadius={10} marginBottom={5}>
      {({ isExpanded }) => {
        const highlighted = isExpanded || completed;
        return (
          <>
            <AccordionButton>
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
                  <Heading size="md" fontWeight="bold">
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
  const defaultIndex = routerContract.contractExists ? [0] : [1];
  return (
    <Accordion defaultIndex={defaultIndex}>
      <OnboardingStep
        title="Step 1: Deploy the Router"
        subtitle="Deploy your router to create and manage your routes"
        completed={routerContract.deploy.isSuccess}
      >
        <DeployContract />
      </OnboardingStep>
      <OnboardingStep
        title="Step 2: Setup your Browser"
        subtitle="Setup a search fallback and your browser"
        completed={false}
      >
        <SetupBrowser />
      </OnboardingStep>
      <OnboardingStep
        title="Step 3: Try your first route"
        subtitle="Create a route and test it out!"
        completed={false}
      >
        <Box>Coming soon...</Box>
      </OnboardingStep>
    </Accordion>
  );
}
