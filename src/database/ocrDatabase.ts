import { searchRoute } from '../lib/onchain';
import { RequestProperties } from '../lib/types';
import { SingleReadDatabase } from './database';

/*
 * @function createOcrDb
 * The functional on chain read database for searching stored routes on chain.
 * @returns A route manager object.
 *
 * @example
 * const db = createOcrDb({
 *  rpc: 'https://alchemy.com/rpc',
 *  searchFallback: 'https://google.com/search?q=%@@@',
 *  address: '0x1234',
 *  contract: '0x5678',
 *  origin: 'https://rout3r.com',
 * });
 * db.getRoute('g').then((route) => console.log(route));
 */
export function createOcrDb(props: RequestProperties): SingleReadDatabase {
  return {
    getRoute: async (command: string) => {
      return searchRoute(command, props);
    },
  };
}
