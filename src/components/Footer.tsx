import { HStack, Icon, Text, useColorMode } from '@chakra-ui/react';
import { mainnet } from 'viem/chains';
import packageJson from '../../package.json';
import { BsGithub } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { TbHandLoveYou } from 'react-icons/tb';

function ModeSwitcher() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [hover, setHover] = useState(false);
  return (
    <HStack
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={toggleColorMode}
      _hover={{ color: 'gray.600' }}
      cursor="pointer"
    >
      <Icon
        as={colorMode === 'dark' ? SunIcon : MoonIcon}
        display="block"
        transition="color 0.6s"
      />
      <Text
        fontSize="small"
        p={0}
        m={0}
        style={{ transition: 'all 0.6s', maxWidth: hover ? 100 : 0 }}
        display="inline-block"
        overflow="hidden"
        whiteSpace="nowrap"
      >
        {colorMode === 'dark' ? 'light' : 'dark'} mode
      </Text>
    </HStack>
  );
}

function CodeLink() {
  const { version } = packageJson;
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  return (
    <HStack
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate('https://github.com/rthomare/rout3r')}
      _hover={{ color: 'gray.600' }}
      cursor="pointer"
    >
      <Icon
        as={BsGithub}
        display="block"
        transition="color 0.6s"
        color={hover ? 'gray.600' : 'inherit'}
      />
      {/* animate text width on hover */}
      <Text
        fontSize="small"
        p={0}
        m={0}
        style={{ transition: 'all 0.6s', maxWidth: hover ? 100 : 0 }}
        display="inline-block"
        overflow="hidden"
        whiteSpace="nowrap"
        color={hover ? 'gray.600' : 'inherit'}
      >
        version {version}
      </Text>
    </HStack>
  );
}

function Donate() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  return (
    <HStack
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() =>
        navigate(
          `${mainnet.blockExplorers?.default.url}/address/` +
            `0x197A002614cd5D82Fa547988A0FF0455f658894A`
        )
      }
      _hover={{ color: 'gray.600' }}
      cursor="pointer"
    >
      <Icon
        as={TbHandLoveYou}
        display="inline"
        overflow="hidden"
        color={hover ? 'gray.600' : 'inherit'}
      />
      <Text
        fontSize="small"
        p={0}
        m={0}
        style={{ transition: 'all 0.6s', maxWidth: hover ? 100 : 0 }}
        display="inline-block"
        overflow="hidden"
        whiteSpace="nowrap"
        color={hover ? 'gray.600' : 'inherit'}
      >
        donate
      </Text>
    </HStack>
  );
}

export function Footer() {
  const { colorMode, toggleColorMode } = useColorMode();
  // get the version from the package.json
  return (
    <HStack fontSize="lg" gap={4} color="GrayText">
      <Donate />
      <ModeSwitcher />
      <CodeLink />
    </HStack>
  );
}
