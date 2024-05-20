import { useCallback, useState } from 'react';
import {
  BsArrowDown,
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
  Code,
  Divider,
  Heading,
  Input,
  ListItem,
  OrderedList,
  VStack,
} from '@chakra-ui/react';
import { isChrome, isSafari, isFirefox } from 'react-device-detect';
import { createRouterURL } from '../lib/engine';
import { useCopy } from '../hooks/useCopy';

export function SetupBrowser(): JSX.Element {
  const copy = useCopy();
  const [searchFallback, setSearchFallback] = useState(
    'https://www.google.com/search?q=%@@@'
  );
  const routerUrl = createRouterURL(window.location.origin, searchFallback);
  const defaultIndex = isChrome ? [0] : isFirefox ? [1] : isSafari ? [2] : [];

  return (
    <VStack alignItems="flex-start">
      <Heading size="sm">Fallback URL</Heading>
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
                Go to&nbsp;
                <Code
                  cursor="pointer"
                  onClick={copy('chrome://settings/searchEngines')}
                >
                  chrome://settings/searchEngines
                </Code>
                &nbsp;in a new tab.
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
                    <Code cursor="pointer" onClick={copy(routerUrl)}>
                      Click here to copy the URL
                    </Code>
                  </ListItem>
                </ul>
              </ListItem>
              <ListItem>
                Click <b>Add</b> to save.
              </ListItem>
            </OrderedList>
            <Divider my={3} />
            <Heading marginTop={3} marginBottom={1} fontWeight={600} size="sm">
              (Optional) Make Rout3r the default search engine
            </Heading>
            <OrderedList>
              <ListItem>
                Find the router entry by clicking on{' '}
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
                (Optional) Click the three dots&nbsp;
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
    </VStack>
  );
}
