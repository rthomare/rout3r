import {
  Box,
  Button,
  ButtonProps,
  keyframes,
  useBoolean,
  useColorMode,
} from '@chakra-ui/react';

const rotate = keyframes`
  0% {background-position: 0 0;}
  50% {background-position: 400% 0;}
  100% {background-position: 0 0;}
`;

export function GlowButton(
  props: ButtonProps & { state?: 'always' | 'hover' }
) {
  const { children, ...rest } = props;
  const [tiggerGlow, { on, off }] = useBoolean();
  const glow = props.state === 'always' || tiggerGlow;
  const colorMode = useColorMode();
  return (
    <Button
      onMouseEnter={on}
      onMouseLeave={off}
      position={'relative'}
      backgroundColor={colorMode.colorMode === 'dark' ? 'black' : 'white'}
      _hover={{
        backgroundColor: colorMode.colorMode === 'dark' ? 'black' : 'white',
      }}
      {...rest}
    >
      <Box
        zIndex={-1}
        top="-2px"
        left="-2px"
        w="calc(100% + 4px)"
        h="calc(100% + 4px)"
        position="absolute"
        filter="blur(5px)"
        background="linear-gradient(
            45deg,
            #ff0000,
            #ff7300,
            #fffb00,
            #48ff00,
            #00ffd5,
            #002bff,
            #7a00ff,
            #ff00c8,
            #ff0000
        );"
        backgroundSize="400%"
        animation={`${rotate} 20s linear reverse infinite`}
        opacity={glow ? 1 : 0}
        transition="opacity 1s ease-in-out"
        borderRadius="8px"
      />
      {children}
    </Button>
  );
}
