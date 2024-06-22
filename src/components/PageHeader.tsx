import { Heading, HeadingProps } from '@chakra-ui/react';

export function PageHeader(
  props: Omit<HeadingProps, 'textTransform' | 'size' | 'letterSpacing'>
) {
  return <Heading size="lg" marginBottom={3} {...props} />;
}
