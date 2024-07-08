import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react';

export function Button(
  props: Omit<ButtonProps, 'fontWeight'> & {
    overrideFontWight?: ButtonProps['fontWeight'];
  }
) {
  const { overrideFontWight, ...rest } = props;
  return <ChakraButton {...rest} fontWeight={overrideFontWight ?? 'normal'} />;
}
