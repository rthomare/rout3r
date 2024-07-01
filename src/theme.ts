import {
  background,
  extendTheme,
  StyleFunctionProps,
  ThemeConfig,
} from '@chakra-ui/react';

import '@fontsource/quattrocento-sans';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: false,
};

const fonts = {
  text: `"Helvetica Neue", HelveticaNeue, "TeX Gyre Heros", TeXGyreHeros, FreeSans, "Nimbus Sans L", "Liberation Sans", Arimo, Helvetica, Arial, sans-serif;`,
  heading: `"Helvetica Neue", HelveticaNeue, "TeX Gyre Heros", TeXGyreHeros, FreeSans, "Nimbus Sans L", "Liberation Sans", Arimo, Helvetica, Arial, sans-serif;`,
  body: `"Helvetica Neue", HelveticaNeue, "TeX Gyre Heros", TeXGyreHeros, FreeSans, "Nimbus Sans L", "Liberation Sans", Arimo, Helvetica, Arial, sans-serif;`,
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      background: props.colorMode === 'dark' ? 'black' : 'white',
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'normal',
      textTransfrom: 'lowercase',
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'normal',
      textTransfrom: 'lowercase',
    },
  },
  Text: {
    baseStyle: {
      fontWeight: 'normal',
      textTransfrom: 'lowercase',
    },
  },
};

const theme = extendTheme({
  config,
  styles,
  fonts,
  components,
});

export default theme;
