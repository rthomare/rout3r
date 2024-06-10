import { Box, HStack, Heading, StackProps, VStack } from '@chakra-ui/react';
import './loader.scss';
import TextTransition, { presets } from 'react-text-transition';

export function Loader(
  props: Omit<StackProps, 'alignItems' | 'justifyContent' | 'gap'> & {
    helperText?: string;
  }
) {
  const { helperText, ...rest } = props;
  return (
    <VStack alignItems="center" justifyContent="center" gap={3} {...rest}>
      <Box className="container" w="25vh" h="25vh">
        <Box className="baton-0">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-1">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-2">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-3">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-4">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-5">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-6">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-7">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-8">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-9">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-10">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-11">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-12">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-13">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-14">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-15">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-16">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-17">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-18">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-19">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-20">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-21">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-22">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-23">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-24">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-25">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-26">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-27">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-28">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-29">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-30">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-31">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-32">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-33">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-34">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
        <Box className="baton-35">
          <Box className="metronome">
            <Box className="baton"></Box>
          </Box>
        </Box>
      </Box>
      <Box className="loading">
        <HStack className="loading-text">
          <Heading size="md">L</Heading>
          <Heading size="md">O</Heading>
          <Heading size="md">A</Heading>
          <Heading size="md">D</Heading>
          <Heading size="md">I</Heading>
          <Heading size="md">N</Heading>
          <Heading size="md">G</Heading>
        </HStack>
      </Box>
      <TextTransition springConfig={presets.wobbly}>
        {helperText}
      </TextTransition>
    </VStack>
  );
}
