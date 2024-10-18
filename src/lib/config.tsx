import { AlchemyAccountsUIConfig, createConfig } from '@account-kit/react';
import { arbitrumSepolia, alchemy } from '@account-kit/infra';
import { QueryClient } from '@tanstack/react-query';

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: 'filled',
  auth: {
    sections: [
      [
        {
          type: 'passkey',
        },
        {
          type: 'social',
          authProviderId: 'google',
          mode: 'popup',
        },
        {
          type: 'social',
          authProviderId: 'facebook',
          mode: 'popup',
        },
      ],
      [
        {
          type: 'external_wallets',
          walletConnect: { projectId: 'your-project-id' },
        },
      ],
    ],
    addPasskeyOnSignup: false,
    header: (
      <img
        src="../../public/android-chrome-192x192.png"
        style={{ height: 48, width: 48 }}
        alt="logo"
      />
    ),
  },
  supportUrl: 'https://rthree.xyz',
};

export const config = createConfig(
  {
    transport: alchemy({ apiKey: 'ez_8oILbkeEP7PCrEPLaDEii-p-9WHqy' }),
    chain: arbitrumSepolia,
    ssr: false, // set to false if you're not using server-side rendering
    enablePopupOauth: true,
  },
  uiConfig
);

export const queryClient = new QueryClient();
