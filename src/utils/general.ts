import { CreateStyled } from '@emotion/styled';

export const transientOptions: Parameters<CreateStyled>[1] = {
  shouldForwardProp: (propName: string) => !propName.startsWith('$'),
};

export default transientOptions;

export const IS_FULL_DEV = import.meta.env.VITE_FULL_DEV ? true : false;

export function shortenAddress(address: string, length = 3): string {
  // + 2 to account for the '0x' prefix
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}
