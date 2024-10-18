import { GlowButton } from './GlowButton';
import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
} from '@account-kit/react';
import './connection.css';

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
      onClick={() => logout}
      type="button"
    >
      {user?.email} (logout)
    </GlowButton>
  );
}
