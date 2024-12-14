import {
  AlchemyAccountsUIConfig,
  AuthType,
  cookieStorage,
  createConfig,
} from '@account-kit/react';
import { arbitrumSepolia, alchemy } from '@account-kit/infra';
import { QueryClient } from '@tanstack/react-query';

// auth configs type is AuthType where type is 'social' and authProviderId is 'google'
export const authConfig: AuthType & {
  type: 'social';
  authProviderId: 'google';
} = {
  type: 'social',
  authProviderId: 'google',
  mode: 'redirect',
  redirectUrl: '/',
};

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: 'filled',
  auth: {
    sections: [[authConfig]],
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
