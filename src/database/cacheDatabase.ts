import { DBSchema, openDB } from 'idb';
import { Route, RouteType } from '../lib/types';
import { ReadDatabase, WriteDatabase } from './database';
import { Address, Chain } from 'viem';

interface routerDB extends DBSchema {
  routes: {
    value: Route;
    key: string; // command
  };
  router: {
    key: Chain['id'];
    value: {
      chain: Chain;
      chainId: Chain['id'];
      account: Address;
      contract: Address;
    };
  };
}

async function openRoutesDB() {
  return openDB<routerDB>('routes', 1, {
    upgrade(db) {
      db.createObjectStore('routes', {
        keyPath: 'command',
      });
    },
  });
}

/*
 * @function createRouteManager
 * The functional manager of routes stored in indexedDB.
 * @returns A route manager object.
 *
 * @example
 * const routeManager = createRouteManager();
 * routeManager.getRoutes().then((routes) => console.log(routes));
 */
export function createRouteDB(): ReadDatabase &
  WriteDatabase & {
    clearRoutes: () => Promise<void>;
  } {
  return {
    /*
     * @function getRoute
     * Gets all the routes from the database.
     * @returns An array of routes.
     *
     * @example
     * routeManager.getRoute().then((route) => console.log(route));
     */
    getRoute: async (command: string) => {
      const db = await openRoutesDB();
      return db.get('routes', command);
    },

    /*
     * @function getAllRoutes
     * Gets all the routes from the database.
     * @returns An array of routes.
     *
     * @example
     * routeManager.getAllRoutes().then((routes) => console.log(routes));
     */
    getRoutes: async ({
      cursor,
      limit,
    }: {
      cursor?: string;
      limit?: bigint;
    }) => {
      const db = await openRoutesDB();
      return db.getAll('routes', null, Number(limit)).then((routes) => ({
        cursor:
          routes.length === Number(limit)
            ? routes[routes.length - 1].command
            : '',
        length: BigInt(routes.length),
        routes,
      }));
    },

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
    addRoute: async (route: Route) => {
      const db = await openRoutesDB();
      const existingItem = await db.get('routes', route.command);
      if (existingItem) {
        throw new Error('An item with the same key already exists!');
      }
      await db.add('routes', { ...route, routeType: RouteType.MANUAL });
      return route;
    },

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
      const db = await openRoutesDB();
      return db.delete('routes', command);
    },

    /*
     * @function clearRoutes
     * Clears all the routes from the database.
     *
     * @example
     * routeManager.clearRoutes();
     */
    clearRoutes: async () => {
      const db = await openRoutesDB();
      return db.clear('routes');
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
    ) => {
      const db = await openRoutesDB();
      const existingItem = await db.get('routes', command);
      if (!existingItem) {
        throw new Error('An item with the same key does not exist!');
      }
      const updatedRoute = {
        ...existingItem,
        ...route,
      };
      await db.put('routes', updatedRoute);
      return updatedRoute;
    },
  };
}
