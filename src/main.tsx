import React from 'react';
import { createRoot } from 'react-dom/client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { processQuery } from './lib/engine';

import App from './App';
import theme from './theme';
import { HashRouter } from 'react-router-dom';

var condition = window.location.href.match('/rout3r/#go') !== null;

// Dynamically load the appropriate module based on the condition
if (condition) {
  // get the query parameters after /#go
  const queryString = window.location.href.split('/#go?')[1];
  if (!queryString) {
    console.error('No query string');
    process.exit(1);
  }
  const params = new URLSearchParams(queryString);
  const searchFallback = params.get('searchFallback');
  const query = params.get('q');
  if (!searchFallback) {
    console.error('No search fallback');
    process.exit(1);
  }
  processQuery(query ?? '', searchFallback)
    .then((url) => {
      // redirect to the processed url
      window.location.href = url;
    })
    .catch((err) => {
      console.error(err);
    });
} else {
  const container = document.getElementById('root');
  if (!container) {
    console.error("Couldn't find root element");
    process.exit(1);
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <HashRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
        </ChakraProvider>
      </HashRouter>
    </React.StrictMode>
  );
}
