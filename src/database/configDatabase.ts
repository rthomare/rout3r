import {
  addRoute,
  deleteRoute,
  getRoute,
  getRoutes,
  updateRoute,
} from '../lib/onchain';
import { OnchainConfig, Route } from '../lib/types';
import { ReadDatabase, WriteDatabase } from './database';

/*
 * @function createOnchainDB
 * The functional manager of routes stored onchain.
 * @returns A route manager object.
 *
 * @example
 * const routeManager = createOnchainDB();
 * routeManager.getRoutes().then((routes) => console.log(routes));
 */
export function createOnchainDB(
  config: OnchainConfig
): ReadDatabase & WriteDatabase {
  return {
    getRoute: async (command: string) => getRoute(config, command),

    /*
     * @function getAllRoutes
     * Gets all the routes from the database.
     * @returns An array of routes.
     *
     * @example
     * routeManager.getAllRoutes().then((routes) => console.log(routes));
     */
    getRoutes: async ({ cursor, limit }: { cursor: string; limit: bigint }) =>
      getRoutes(config, cursor, limit),

    /*
     * @function addRoute
     * Adds a route to the database.
     * @param route - The route to add.
     * @returns The route that was added.
     *
     * @example
     * routeManager.addRoute({
     *   command: 'g',
     *   name: 'Google',
     *   description: 'Searches Google',
     *   url: 'https://www.google.com/search?q=%@@@',
     *   subRoutes: [],
     * });
     */
    addRoute: async (route: Route) => addRoute(config, route),

    /*
     * @function deleteRoute
     * Removes a route from the database.
     * @param command - The command of the route to remove.
     * @returns The route that was removed.
     *
     * @example
     * routeManager.deleteRoute('g').then((route) => console.log(route));
     */
    deleteRoute: async (command: string) => {
      await deleteRoute(config, command);
    },

    /*
     * @function updateRoute
     * Updates a route in the database.
     * @param route - The route to update.
     * @returns The route that was updated.
     *
     * @example
     * routeManager.updateRoute({
     *   command: 'g',
     *   name: 'Google',
     *   description: 'Searches Google',
     *   url: 'https://www.google.com/search?q=%@@@',
     *   subRoutes: [],
     * });
     */
    updateRoute: async (
      command: string,
      route: Omit<Route, 'command' | 'routeType' | 'isValue'>
    ) => updateRoute(config, command, route),
  };
}
