import { GlowButton } from './GlowButton';
import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
} from '@account-kit/react';
import './connection.css';
import { Tooltip } from '@chakra-ui/react';

export function ConnectButton() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();

  if (!signerStatus.isConnected) {
    return (
      <GlowButton
        fontSize="lg"
        fontWeight="normal"
        onClick={openAuthModal}
        type="button"
      >
        connect
      </GlowButton>
    );
  }
  return (
    <GlowButton
      fontSize="md"
      fontWeight="normal"
      onClick={logout as () => void}
      type="button"
    >
      <Tooltip label={`logged in as ${user?.email}`}>logout</Tooltip>
    </GlowButton>
  );
}
