import { GlowButton } from './GlowButton';
import {
  useAuthenticate,
  useLogout,
  useSignerStatus,
  useUser,
} from '@account-kit/react';
import './connection.css';
import { Tooltip } from '@chakra-ui/react';

export function ConnectButton() {
  const user = useUser();
  const { authenticate, isPending } = useAuthenticate();

  const signerStatus = useSignerStatus();
  const { logout } = useLogout();

  if (!signerStatus.isConnected) {
    return (
      <GlowButton
        fontSize="lg"
        fontWeight="normal"
        isLoading={isPending}
        onClick={() =>
          authenticate({
            // redirect login flow
            type: 'oauth',
            authProviderId: 'google',
            mode: 'popup',
          })
        }
        type="button"
      >
        start
      </GlowButton>
    );
  }
  return (
    <>
      <GlowButton
        fontSize="md"
        fontWeight="normal"
        onClick={logout as () => void}
        type="button"
      >
        <Tooltip label={`logged in as ${user?.email}`}>logout</Tooltip>
      </GlowButton>
    </>
  );
}
