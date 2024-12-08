import {
  AlchemyAccountsUIConfig,
  cookieStorage,
  createConfig,
} from '@account-kit/react';
import { arbitrumSepolia, alchemy } from '@account-kit/infra';
import { QueryClient } from '@tanstack/react-query';

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: 'filled',
  auth: {
    sections: [
      [
        {
          type: 'social',
          authProviderId: 'google',
          mode: 'popup',
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
    ssr: false,
    storage: cookieStorage,
    enablePopupOauth: true,
  },
  uiConfig
);

export const queryClient = new QueryClient();
