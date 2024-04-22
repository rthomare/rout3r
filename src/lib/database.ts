import { DBSchema, openDB } from 'idb';

import { Route } from './types';

interface routerDB extends DBSchema {
  routes: {
    value: Route;
    key: string; // command
  };
}

async function openRouterDB() {
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
export function createRouteDB() {
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
      const db = await openRouterDB();
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
    getAllRoutes: async () => {
      const db = await openRouterDB();
      return db.getAll('routes');
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
      const db = await openRouterDB();
      await db.add('routes', route);
      return route;
    },

    /*
     * @function removeRoute
     * Removes a route from the database.
     * @param command - The command of the route to remove.
     * @returns The route that was removed.
     *
     * @example
     * routeManager.removeRoute('g').then((route) => console.log(route));
     */
    removeRoute: async (command: string) => {
      const db = await openRouterDB();
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
      const db = await openRouterDB();
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
    updateRoute: async (command: string, route: Omit<Route, 'command'>) => {
      const db = await openRouterDB();
      await db.put('routes', { command, ...route });
      return { command, ...route };
    },
  };
}
