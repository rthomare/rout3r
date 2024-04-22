import React from 'react';
import { createRoot } from 'react-dom/client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { processQuery } from './lib/engine';

import App from './App';
import theme from './theme';

var condition = window.location.pathname === '/rout3r/go';

// Dynamically load the appropriate module based on the condition
if (condition) {
  const params = new URLSearchParams(window.location.search);
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
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChakraProvider>
    </React.StrictMode>
  );
}
