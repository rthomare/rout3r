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
  text: `'Quattrocento Sans', sans-serif`,
  heading: `'Quattrocento Sans', sans-serif`,
  body: `'Quattrocento Sans', sans-serif`,
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      background: props.colorMode === 'dark' ? 'black' : 'white',
    },
    Button: {
      background: props.colorMode === 'dark' ? '#1A1B1F' : 'white',
    },
  }),
};

const theme = extendTheme({
  config,
  styles,
  fonts,
});

export default theme;
