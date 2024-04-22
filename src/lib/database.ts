import { DBSchema, openDB } from 'idb';

import { Route } from './types';

const reservedRoutes: { [key: string]: Route } = {
  r3: {
    command: 'r3',
    name: 'rout3r Menu',
    description: 'Takes you to rout3r',
    url: window.location.origin + '/rout3r/',
    subRoutes: [
      {
        command: 'setup',
        url: window.location.origin + '/rout3r/setup',
      },
      {
        command: 'about',
        url: window.location.origin + '/rout3r/about',
      },
      {
        command: 'new',
        url: window.location.origin + '/rout3r/routes/new',
      },
      {
        command: 'edit',
        url: window.location.origin + '/rout3r/route/%@@@',
      },
    ],
    type: 'reserved',
  },
};

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
      if (reservedRoutes[command]) {
        return reservedRoutes[command];
      }
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
      return db.getAll('routes').then((routes) => {
        return [...Object.values(reservedRoutes), ...routes];
      });
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
      const existingItem = await db.get('routes', route.command);
      if (existingItem) {
        throw new Error('An item with the same key already exists!');
      }
      await db.add('routes', { ...route, type: 'manual' });
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
      if (reservedRoutes[command]) {
        throw new Error('Cannot remove a reserved route!');
      }
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
      if (reservedRoutes[command]) {
        throw new Error('Cannot update a reserved route!');
      }
      const db = await openRouterDB();
      await db.put('routes', { command, ...route });
      return { command, ...route };
    },
  };
}
