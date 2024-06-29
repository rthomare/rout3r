import { ButtonProps, Button as ChakraButton } from '@chakra-ui/react';

export function Button(
  props: Omit<ButtonProps, 'fontWeight'> & {
    overrideFontWight?: ButtonProps['fontWeight'];
  }
) {
  return (
    <ChakraButton {...props} fontWeight={props.overrideFontWight ?? 'normal'} />
  );
}
