import { CreateStyled } from '@emotion/styled';
import { SUBROUTE_SEPERATOR } from '../lib/constants';

export const transientOptions: Parameters<CreateStyled>[1] = {
  shouldForwardProp: (propName: string) => !propName.startsWith('$'),
};

export default transientOptions;

export const IS_FULL_DEV = import.meta.env.VITE_FULL_DEV ? true : false;

export function shortenAddress(address: string, length = 3): string {
  // + 2 to account for the '0x' prefix
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

export function mapSubroute(subroute: string): {
  command: string;
  url: string;
} {
  const split = subroute.split(SUBROUTE_SEPERATOR);
  if (split.length < 1) {
    throw 'Error with subroute string please confirm it follows form <command>::<url>';
  }
  return {
    command: split[0],
    url: split.splice(1).join(''),
  };
}

export function mapSubroutes(subroutes: string[]): {
  command: string;
  url: string;
}[] {
  return subroutes.map(mapSubroute);
}

export function unmapSubroute(subroute: {
  command: string;
  url: string;
}): string {
  return `${subroute.command}${SUBROUTE_SEPERATOR}${subroute.url}`;
}

export function unmapSubroutes(subroutes: { command: string; url: string }[]) {
  return subroutes.map(unmapSubroute);
}
