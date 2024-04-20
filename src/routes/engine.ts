import { createRouteDB } from './database';
import { Route, RouteData } from './types';

/*
 * @function createRouterURL
 * Creates a route url.
 * @returns A route url.
 *
 * @example
 * const routeUrl = createRouterURL(
 *    https://alchemy.com/rpc,
 *    https://google.com/search?q=%@@@
 * );
 */
export function createRouterURL(
  origin: string,
  rpcUrl: string,
  searchFallback: string
): string {
  // url encode rpcUrl and searchFallback
  return `${origin}/rout3r/command?rpcUrl=${encodeURIComponent(
    rpcUrl
  )}&searchFallback=${encodeURIComponent(searchFallback)}`;
}

/*
 * @function traverseRoute
 * Finds and maps to the correct routing data based on the query.
 * @param route - The route to traverse.
 * @param query - The query to traverse the route with.
 * @returns The correct routeData and query.
 *
 * @example
 * const route = {
 *   command: 'g',
 *   name: 'Google',
 *   description: 'Searches Google',
 *   url: 'https://google.com/search?q=%@@@',
 *   subRoutes: [
 *     {
 *       command: 'i',
 *       name: 'Images',
 *       description: 'Searches Google Images',
 *       url: 'https://google.com/search?tbm=isch&q=%@@@',
 *       subRoutes: [],
 *     },
 *   ],
 * };
 * const query = 'i something';
 * const { routeData, query } = traverseRoute(route, query);
 * console.log(routeData);
 * -> { command: 'i', ..., url: 'https://google.com/search?tbm=isch&q=%@@@' }
 * console.log(query);
 * -> 'something'
 */
export function traverseRoute(
  { subRoutes, ...routeData }: Route,
  routeQuery?: string
): { routeData: RouteData; routeQuery?: string } {
  if (subRoutes.length === 0) {
    return { routeData, routeQuery };
  }
  const subcommand = routeQuery?.split(' ')[0];
  if (!subcommand || subcommand === '') {
    return { routeData, routeQuery };
  }
  const subRoute = subRoutes.find((sr) => sr.command === subcommand);
  if (!subRoute) {
    return { routeData, routeQuery };
  }

  const newQuery = routeQuery.split(' ').slice(1).join(' ');
  return traverseRoute({ ...subRoute, subRoutes: [] }, newQuery.trim());
}

/*
 * @function getRouteUrl
 * Gets the url based on the route and query.
 * @param route - The route to get the url from.
 * @param query - The query to get the url with.
 * @returns The url.
 *
 * @example
 * const route = {
 *   command: 'g',
 *   name: 'Google',
 *   description: 'Searches Google',
 *   url: 'https://google.com/search?q=%@@@',
 *   subRoutes: [
 *     {
 *       command: 'i',
 *       name: 'Images',
 *       description: 'Searches Google Images',
 *       url: 'https://google.com/search?tbm=isch&q=%@@@',
 *     },
 *     {
 *        command: 'v',
 *        name: 'Videos',
 *        description: 'Go to google vides',
 *        url: 'https://google.com/videohp',
 *      }
 *   ],
 * };
 * const query = 'something';
 * console.log(getUrl(route, query));
 * -> 'https://google.com/search?q=something'
 * const query = 'i something';
 * console.log(getUrl(route, query));
 * -> 'https://google.com/search?tbm=isch&q=something'
 * const query = 'v';
 * console.log(getUrl(route, query));
 * -> 'https://google.com/videohp'
 */
export function getRouteUrl(route: Route, query: string): string {
  const { routeData, routeQuery } = traverseRoute(route, query);
  // return url encoded routeData.url and routeQuery
  return routeData.url.replace(
    '%@@@',
    routeQuery ? encodeURIComponent(routeQuery) : ''
  );
}

/*
 * @function processQuery
 * Processes the query and returns the url.
 * @param query - The query to process.
 * @param fallback - The fallback url.
 * @returns The url.
 *
 * @example
 * const query = 'g something';
 * console.log(processQuery(query, 'https://google.com/search?q=%@@@'));
 * -> 'https://google.com/search?q=something'
 */
export async function processQuery(query: string, fallback: string) {
  const db = createRouteDB();
  const [command, substring] = [
    query.split(' ')[0],
    query.split(' ').slice(1).join(' ') ?? '',
  ];
  const route = await db.getRoute(command);
  if (route) {
    return getRouteUrl(route, substring);
  }
  return fallback.replace('%@@@', query ?? '');
}
