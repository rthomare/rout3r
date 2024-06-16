import {
  type Address,
  type EIP1193RequestFn,
  type Hex,
  RpcRequestError,
  SwitchChainError,
  type Transport,
  type WalletRpcSchema,
  custom,
  fromHex,
  getAddress,
  numberToHex,
  HDAccount,
} from 'viem';
import { rpc } from 'viem/utils';
import { createConnector } from 'wagmi';

export type AnvilParameters = {
  account: HDAccount;
};

anvilConnector.type = 'anvil' as const;
export function anvilConnector(parameters: AnvilParameters) {
  type Provider = ReturnType<
    Transport<'custom', unknown, EIP1193RequestFn<WalletRpcSchema>>
  >;
  let connectedChainId: number;
  return createConnector<Provider>((config) => ({
    id: 'anvil',
    name: 'Anvil Connector',
    type: anvilConnector.type,
    async setup() {
      connectedChainId = config.chains[0].id;
    },
    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId) {
        const chain = await this.switchChain!({ chainId });
        currentChainId = chain.id;
      }

      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: currentChainId,
      };
    },
    async disconnect() {},
    async getAccounts() {
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: 'eth_accounts' });
      return accounts.map((x) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: 'eth_chainId' });
      return fromHex(hexChainId, 'number');
    },
    async isAuthorized() {
      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain) throw new SwitchChainError(new Error('Chain not found'));

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: numberToHex(chainId) }],
      });
      return chain;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },
    async onDisconnect(_error) {
      config.emitter.emit('disconnect');
    },
    async getProvider({ chainId } = {}) {
      const chain =
        config.chains.find((x) => x.id === chainId) ?? config.chains[0];
      const url = chain.rpcUrls.default.http[0]!;

      const request: EIP1193RequestFn = async ({ method, params }) => {
        const anyParams = params as any;
        // eth methods
        if (method === 'eth_chainId') return numberToHex(connectedChainId);
        if (method === 'eth_requestAccounts')
          return [parameters.account.address];
        if (method === 'eth_signTypedData_v4')
          return parameters.account.signTypedData(anyParams[0]);

        // wallet methods
        if (method === 'wallet_switchEthereumChain') {
          type Params = [{ chainId: Hex }];
          connectedChainId = fromHex((params as Params)[0].chainId, 'number');
          this.onChainChanged(connectedChainId.toString());
          return;
        }

        // other methods
        if (method === 'personal_sign') {
          // Change `personal_sign` to `eth_sign` and swap params
          method = 'eth_sign';
          type Params = [data: Hex, address: Address];
          params = [(params as Params)[1], (params as Params)[0]] as any;
          return parameters.account.signMessage({ message: anyParams[1] });
        }

        if (method === 'eth_sign') {
          return parameters.account.signMessage({ message: anyParams[1] });
        }

        const body = { method, params };
        const { error, result } = await rpc.http(url, { body });
        if (error) throw new RpcRequestError({ body, error, url });

        return result;
      };
      return custom({ request })({ retryCount: 0 });
    },
  }));
}
