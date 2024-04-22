import { useCallback, useState } from 'react';
import {
  BsBrowserChrome,
  BsBrowserFirefox,
  BsBrowserSafari,
  BsThreeDotsVertical,
} from 'react-icons/bs';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  Center,
  Code,
  Heading,
  Input,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { createRouterURL } from '../lib/engine';

function SetupCompleteModal({
  rpcUrl,
  searchFallback,
}: {
  rpcUrl: string;
  searchFallback: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [generatedRouterUrl, setGeneratedRouterUrl] = useState('');
  const generateLink = useCallback(() => {
    const url = createRouterURL(window.location.origin, rpcUrl, searchFallback);
    setGeneratedRouterUrl(url);
    onOpen();
  }, [rpcUrl, searchFallback, onOpen, setGeneratedRouterUrl]);
  const toast = useToast();

  const copy = useCallback(
    (item: string) => () => {
      navigator.clipboard.writeText(item);
      toast({
        position: 'top',
        title: 'Copied!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    [toast]
  );

  return (
    <>
      <Button onClick={generateLink}>Generate Link</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Setup your rout3r</ModalHeader>
          <ModalCloseButton />
          <ModalBody minW="80%">
            <Text mb={4}>
              You created your rout3r URL. 🎉 Follow the steps below for your
              browser.
            </Text>

            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <BsBrowserChrome />
                  &nbsp;Chrome
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <OrderedList>
                    <ListItem>
                      Go to&nbsp;
                      <Code
                        cursor="pointer"
                        onClick={copy('chrome://settings/searchEngines')}
                      >
                        chrome://settings/searchEngines
                      </Code>
                    </ListItem>
                    <ListItem>
                      Next to <b>Site Search</b> click <b>Add</b>
                    </ListItem>
                    <ListItem>
                      In the search engine popup enter:
                      <ul>
                        <ListItem>
                          <b>Name:</b>{' '}
                          <Code cursor="pointer" onClick={copy('rout3r')}>
                            rout3r
                          </Code>
                        </ListItem>
                        <ListItem>
                          <b>Shortcut:</b>{' '}
                          <Code cursor="pointer" onClick={copy('r')}>
                            r
                          </Code>{' '}
                          (or any other keyword you want)
                        </ListItem>
                        <ListItem>
                          <b>URL:</b>
                          <Code
                            cursor="pointer"
                            onClick={copy(generatedRouterUrl)}
                          >
                            Click here to copy the URL
                          </Code>
                        </ListItem>
                      </ul>
                    </ListItem>
                    <ListItem>
                      Click <b>Add</b> to save.
                    </ListItem>
                    <ListItem>
                      (Optional) Click the three dots&nbsp;
                      <BsThreeDotsVertical
                        style={{
                          display: 'inline',
                        }}
                      />
                      &nbsp;and select <b>Make default</b>.
                    </ListItem>
                    <ListItem>
                      Try it out by typing in{' '}
                      <Code cursor="pointer" onClick={copy('r list')}>
                        r list
                      </Code>{' '}
                      into your browser address bar.
                    </ListItem>
                  </OrderedList>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <BsBrowserFirefox />
                  &nbsp;Firefox
                </AccordionButton>
                <AccordionPanel pb={4}>Not supported yet.</AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <BsBrowserSafari />
                  &nbsp; Safari
                </AccordionButton>
                <AccordionPanel pb={4}>Not supported yet.</AccordionPanel>
              </AccordionItem>
            </Accordion>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost" onClick={copy(generatedRouterUrl)}>
              Copy Link
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export function Setup(): JSX.Element {
  const [rpcUrl, setRpcUrl] = useState('');
  const [searchFallback, setSearchFallback] = useState(
    'https://www.google.com/search?q=%@@@'
  );

  return (
    <Center
      as="header"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      h="100%"
      fontSize="3xl"
      gap={4}
    >
      <Heading size="2xl">Setup your rout3r</Heading>
      <Text fontSize="lg">Login with your wallet to start setup</Text>
      <Input
        placeholder="Enter your RPC URL"
        value={rpcUrl}
        onChange={(e) => setRpcUrl(e.target.value)}
      />
      <Input
        placeholder="Enter your Fallback Search URL"
        value={searchFallback}
        onChange={(e) => setSearchFallback(e.target.value)}
      />
      <SetupCompleteModal rpcUrl={rpcUrl} searchFallback={searchFallback} />
    </Center>
  );
}
