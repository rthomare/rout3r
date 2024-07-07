import { ConnectButton as RConnectButton } from '@rainbow-me/rainbowkit';
import { GlowButton } from './GlowButton';

export function ConnectButton() {
  return (
    <RConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <GlowButton
                    fontSize="lg"
                    fontWeight="normal"
                    onClick={openConnectModal}
                    type="button"
                  >
                    connect
                  </GlowButton>
                );
              }

              if (chain.unsupported) {
                return (
                  <GlowButton
                    fontSize="md"
                    fontWeight="normal"
                    onClick={openChainModal}
                    type="button"
                  >
                    wrong network
                  </GlowButton>
                );
              }

              return (
                <GlowButton
                  fontSize="md"
                  fontWeight="normal"
                  onClick={openAccountModal}
                  type="button"
                >
                  {account.displayName.toLowerCase()}
                </GlowButton>
              );
            })()}
          </div>
        );
      }}
    </RConnectButton.Custom>
  );
}
