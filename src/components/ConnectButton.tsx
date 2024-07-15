import { useAuthModal, useSignerStatus, useUser } from '@account-kit/react';
import { GlowButton } from './GlowButton';

import './connection.css';
import { Spinner } from '@chakra-ui/react';

export function ConnectButton() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  if (!signerStatus || signerStatus.isInitializing) {
    return <Spinner size="sm" />;
  }

  if (user) {
    return (
      <GlowButton
        fontSize="md"
        fontWeight="normal"
        onClick={openAuthModal}
        type="button"
      >
        {user.userId}
      </GlowButton>
    );
  }

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
