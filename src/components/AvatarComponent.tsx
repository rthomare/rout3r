import { SettingsIcon } from '@chakra-ui/icons';
import { Box, IconButton, Image } from '@chakra-ui/react';
import { AvatarComponent } from '@rainbow-me/rainbowkit';
import { useNavigate } from 'react-router-dom';
import { isAddress } from 'viem';

// Main function to run everything
function createGradientAvatar(walletAddress: string) {
  if (!isAddress(walletAddress)) {
    return 'linear-gradient(45deg, #000000, #888888, #000000)';
  }
  // split up the address into 6 character chunks, not the first part starts with 0x so we skip that
  // the last chunk will be 4 characters long
  // for the last chuck check if is an even number or odd number
  const addressChunks = walletAddress.slice(2).match(/.{1,6}/g);
  if (!addressChunks) {
    return 'linear-gradient(45deg, #000000, #888888, #000000)';
  }
  const isOdd = parseInt(addressChunks[5], 16) % 2 === 1;
  // if the number is even make a gradient with the first set of 3 chunks,
  // if the number is odd make a gradient with the last set of 3 chunks
  const startIndex = isOdd ? 3 : 0;
  return (
    'linear-gradient(45deg,' +
    `#${addressChunks[startIndex]},` +
    `#${addressChunks[startIndex + 1]},` +
    `#${addressChunks[startIndex + 2]})`
  );
}

export const WalletAvatar: AvatarComponent = ({
  address,
  ensImage,
  size,
}: {
  address: string;
  ensImage?: string | null;
  size: number;
}) => {
  const navigate = useNavigate();
  const color = createGradientAvatar(address);
  return (
    <Box position="relative">
      {ensImage ? (
        <Image
          src={ensImage}
          width={size}
          height={size}
          borderRadius={size / 2}
        />
      ) : (
        <Box
          background={color}
          borderRadius={size / 2}
          height={size}
          width={size}
        />
      )}
      <IconButton
        position="absolute"
        icon={<SettingsIcon />}
        onClick={() => window.location.replace(`${origin}/#settings`)}
        background="#00000000"
        aria-label={''}
      />
    </Box>
  );
};
