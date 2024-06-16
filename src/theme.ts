import { extendTheme, StyleFunctionProps, ThemeConfig } from '@chakra-ui/react';
import '@fontsource/quattrocento-sans';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: false,
};

const fonts = {
  text: `'Quattrocento Sans', sans-serif`,
  heading: `'Quattrocento Sans', sans-serif`,
  body: `'Quattrocento Sans', sans-serif`,
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      background: props.colorMode === 'dark' ? 'black' : 'white',
    },
  }),
};

const theme = extendTheme({
  config,
  styles,
  fonts,
});

export default theme;
