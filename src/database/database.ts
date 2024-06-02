import { Route } from '../lib/types';

/*
 * @interface Database
 * The interface for the database of Routes.
 */
export interface SingleReadDatabase {
  /*
   * @function getRoute
   * Gets a route from the database.
   * @param command The command of the route.
   * @returns The route.
   *
   * @example
   * const db = .....; // create database
   * const route = await db.getRoute('g');
   */
  getRoute: (command: string) => Promise<Route | undefined>;
}

/*
 * @interface Database
 * The interface for the database of Routes.
 */
export interface ReadDatabase extends SingleReadDatabase {
  /*
   * @function getAllRoutes
   * Gets all routes from the database.
   * @returns An array of routes.
   *
   * @example
   * const db = .....; // create database
   * const routes = await db.getAllRoutes('g', 10n);
   */
  getRoutes: ({ cursor, limit }: { cursor: string; limit: bigint }) => Promise<{
    routes: Route[];
    cursor: string;
    length: bigint;
  }>;
}

/*
 * @interface Database
 * The interface for the database of Routes.
 */
export interface WriteDatabase {
  /*
   * @function addRoute
   * Adds a route to the database.
   * @param route The route to add.
   * @returns The added route.
   *
   * @example
   * const db = .....; // create database
   * const route = await db.addRoute({ command: 'g', ... });
   */
  addRoute: (route: Route) => Promise<Route>;

  /*
   * @function updateRoute
   * Updates a route in the database.
   * @param route The route to update.
   * @returns The updated route.
   *
   * @example
   * const db = .....; // create database
   * const route = await db.updateRoute({ command: 'g', ... });
   */
  updateRoute: (
    command: string,
    route: Omit<Route, 'command' | 'routeType' | 'isValue'>
  ) => Promise<Route>;

  /*
   * @function deleteRoute
   * Deletes a route from the database.
   * @param command The command of the route to delete.
   *
   * @example
   * const db = .....; // create database
   * await db.deleteRoute('g');
   */
  deleteRoute: (command: string) => Promise<void>;
}
