import { arbitrumSepolia } from '@account-kit/infra';
import { cookieStorage, createConfig } from '@account-kit/react';

export const appConfig = createConfig(
  {
    apiKey: 'YOUR_API_KEY_HERE',
    chain: arbitrumSepolia,
    storage: cookieStorage,
  },
  {
    illustrationStyle: 'outline',
    auth: {
      sections: [[{ type: 'email' }], [{ type: 'passkey' }]],
      addPasskeyOnSignup: false,
    },
  }
);
