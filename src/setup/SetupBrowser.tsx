import { useCallback, useMemo, useState } from 'react';
import { isChrome, isFirefox, isSafari } from 'react-device-detect';
import {
  BsBrowserChrome,
  BsBrowserFirefox,
  BsBrowserSafari,
  BsChevronDown,
  BsThreeDotsVertical,
} from 'react-icons/bs';

import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  Code,
  Divider,
  Heading,
  Input,
  InputGroup,
  ListItem,
  OrderedList,
  VStack,
} from '@chakra-ui/react';

import { useCopy } from '../hooks/useCopy';
import { useOnchain } from '../hooks/useOnchain';
import { SEARCH_REPLACEMENT } from '../lib/constants';
import { AppSettings } from '../lib/types';
import { createRouterURL } from '../lib/engine';

function defaultBrowserIndex() {
  if (isChrome) return [0];
  if (isFirefox) return [1];
  if (isSafari) return [2];
  return [0];
}

export function SetupBrowser({
  onSetup,
}: {
  onSetup: () => void;
}): JSX.Element {
  const copy = useCopy();
  const [searchFallback, setSearchFallback] = useState(
    `https://www.google.com/search?q=${SEARCH_REPLACEMENT}`
  );
  const defaultIndex = defaultBrowserIndex();
  const { config } = useOnchain();
  const appSettings: Omit<AppSettings, 'searchFallback'> = {
    rpc: config.walletClient.chain.rpcUrls.default.http[0],
    chainId: config.walletClient.chain.id,
    address: config.walletClient.account.address,
    contract: config.contract?.address ?? '0x',
  };
  const routerUrl = useMemo(
    () => createRouterURL({ ...appSettings, searchFallback: searchFallback }),
    [appSettings]
  );

  return (
    <>
      <VStack alignItems="flex-start">
        <Heading size="sm">fallback url</Heading>
        <Input
          mb={3}
          placeholder="Enter your Fallback Search URL"
          value={searchFallback}
          onChange={(e) => setSearchFallback(e.target.value)}
        />
        <Accordion allowToggle defaultIndex={defaultIndex} w="100%">
          <AccordionItem>
            <AccordionButton>
              <BsBrowserChrome />
              &nbsp;Chrome
            </AccordionButton>
            <AccordionPanel pb={4}>
              <OrderedList>
                <ListItem>
                  go to&nbsp;
                  <Code
                    cursor="pointer"
                    onClick={copy('chrome://settings/searchEngines')}
                  >
                    chrome://settings/searchEngines
                  </Code>
                  &nbsp;in a new tab.
                </ListItem>
                <ListItem>
                  next to <b>site search</b> click <b>Add</b>
                </ListItem>
                <ListItem>
                  in the search engine popup enter:
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
                      <InputGroup gap={1}>
                        <Input value={routerUrl} isReadOnly cursor="pointer" />
                        <Button onClick={copy(routerUrl)}>copy</Button>
                      </InputGroup>
                    </ListItem>
                  </ul>
                </ListItem>
                <ListItem>
                  click <b>Add</b> to save.
                </ListItem>
              </OrderedList>
              <Divider my={3} />
              <Heading
                marginTop={3}
                marginBottom={1}
                fontWeight={600}
                size="sm"
              >
                (optional) make Rout3r the default search engine
              </Heading>
              <OrderedList>
                <ListItem>
                  find the router entry by clicking on{' '}
                  <b>
                    Additional sites{' '}
                    <BsChevronDown
                      style={{
                        display: 'inline',
                      }}
                    />
                  </b>{' '}
                  and finding it under the name <b>rout3r</b>.
                </ListItem>
                <ListItem>
                  (optional) click the three dots&nbsp;
                  <BsThreeDotsVertical
                    style={{
                      display: 'inline',
                    }}
                  />
                  &nbsp;and select <b>Make default</b>.
                </ListItem>
              </OrderedList>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <BsBrowserFirefox />
              &nbsp;Firefox
            </AccordionButton>
            <AccordionPanel pb={4}>not supported yet.</AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <BsBrowserSafari />
              &nbsp; Safari
            </AccordionButton>
            <AccordionPanel pb={4}>not supported yet.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
      <Button onClick={onSetup} mt={2}>
        next
      </Button>
    </>
  );
}
