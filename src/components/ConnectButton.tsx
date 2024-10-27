import { useAccount, useAuthModal, useUser } from '@account-kit/react';

import { Button } from './Button';
import { GlowButton } from './GlowButton';

import './connection.css';

export function ConnectButton() {
  const { openAuthModal } = useAuthModal();
  const { account } = useAccount({ type: 'LightAccount' });
  const user = useUser();

  return !user || !account ? (
    <Button onClick={() => openAuthModal()}>Connect</Button>
  ) : (
    <GlowButton fontSize="md" fontWeight="normal" type="button">
      {user.email?.toLowerCase() ?? account.address}
    </GlowButton>
  );
}
