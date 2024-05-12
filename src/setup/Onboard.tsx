import { CheckCircleIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { useSetup } from '../hooks/useSetup';
import { SetupBrowser } from './SetupBrowser';

function OnboardingStep({
  title,
  completed,
  children,
}: React.PropsWithChildren<{ title: string; completed: boolean }>) {
  return (
    <AccordionItem border="solid 1px" borderRadius={10} marginBottom={5}>
      {({ isExpanded }) => (
        <>
          <AccordionButton>
            <Flex w="100%" alignItems="center" justifyContent="space-between">
              <Heading
                size="md"
                fontWeight="bold"
                color={isExpanded || completed ? undefined : 'gray.500'}
              >
                {title}
              </Heading>
              <CheckCircleIcon
                fontSize="large"
                color={completed ? 'green.500' : 'gray.500'}
              />
            </Flex>
          </AccordionButton>
          <AccordionPanel pb={4}>{children}</AccordionPanel>
        </>
      )}
    </AccordionItem>
  );
}

export function Onboard() {
  const setup = useSetup();

  return (
    <>
      <Accordion>
        <OnboardingStep
          title="Step 1: Deploy the Router"
          completed={setup.deploy.isSuccess}
        >
          <p>
            The router is a smart contract that will allow you to create and
            manage your routes.
          </p>
          <Button
            mt={2}
            onClick={() => setup.deploy.mutateAsync}
            isLoading={setup.deploy.isPending}
          >
            Deploy Router
          </Button>
        </OnboardingStep>
        <OnboardingStep
          title="Step 2: Deploy the Router"
          completed={setup.deploy.isSuccess}
        >
          <p>
            The router is a smart contract that will allow you to create and
            manage your routes.
          </p>
          <Button isLoading={setup.deploy.isPending}>Deploy Router</Button>
        </OnboardingStep>
        <OnboardingStep title="Step 3: Setup your browser" completed={false}>
          <SetupBrowser />
        </OnboardingStep>
      </Accordion>
    </>
  );
}
