import { Heading, HeadingProps } from '@chakra-ui/react';

export function PageHeader(
  props: Omit<HeadingProps, 'textTransform' | 'size' | 'letterSpacing'>
) {
  return (
    <Heading
      size="lg"
      textTransform="uppercase"
      letterSpacing=".1rem"
      marginBottom={3}
      {...props}
    />
  );
}
