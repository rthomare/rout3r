import { Button } from '@chakra-ui/react';
import { ConnectButton as RConnectButton } from '@rainbow-me/rainbowkit';

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
                  <Button
                    fontSize="lg"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button fontSize="lg" onClick={openChainModal} type="button">
                    Wrong network
                  </Button>
                );
              }

              return (
                <Button fontSize="lg" onClick={openAccountModal} type="button">
                  {account.displayName}
                </Button>
              );
            })()}
          </div>
        );
      }}
    </RConnectButton.Custom>
  );
}
