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
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouterContract } from '../hooks/useRouterContract';
import { SetupBrowser } from './SetupBrowser';
import { BsCheckCircle, BsCheckCircleFill } from 'react-icons/bs';
import { DeployContract } from './DeployContract';
import { useCopy } from '../hooks/useCopy';
import { useState } from 'react';

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
  const [index, setIndex] = useState(routerContract.address.data ? 1 : 0);
  const copy = useCopy();
  return (
    <Accordion index={index}>
      <OnboardingStep
        title="Step 1: Deploy the Router"
        subtitle="Deploy your router to create and manage your routes"
        completed={!!routerContract.address.data}
        onClick={() => setIndex(0)}
      >
        <DeployContract />
      </OnboardingStep>
      <OnboardingStep
        title="Step 2: Setup your Browser"
        subtitle="Setup a search fallback and your browser"
        completed={index > 1}
        onClick={() => setIndex(1)}
      >
        <SetupBrowser />
        <Button onClick={() => setIndex(2)} mt={2}>
          Next
        </Button>
      </OnboardingStep>
      <OnboardingStep
        title="Step 3: Try your first route"
        subtitle="Create a route and test it out!"
        completed={false}
        onClick={() => setIndex(2)}
      >
        <Text>
          Try it out by typing in{' '}
          <Code cursor="pointer" onClick={copy('r list')}>
            r list
          </Code>{' '}
          into your browser address bar!
        </Text>
      </OnboardingStep>
    </Accordion>
  );
}
