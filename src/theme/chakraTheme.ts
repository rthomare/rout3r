import { extendTheme, StyleFunctionProps, ThemeConfig } from '@chakra-ui/react';
import { fonts } from './baseTheme';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: false,
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

export const chakraTheme = extendTheme({
  config,
  styles,
  fonts,
  components,
});
