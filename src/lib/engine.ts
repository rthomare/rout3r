import { mapSubroutes } from '../utils/general';
import { SEARCH_REPLACEMENT } from './constants';
import { AppSettings, Route } from './types';

export function storeAppSettings(params: AppSettings) {
  localStorage.setItem('appSettings', JSON.stringify(params));
}

export function retrieveAppSettings(): AppSettings | undefined {
  const json = localStorage.getItem('appSettings');
  return json ? JSON.parse(json) : undefined;
}

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
export function createRouterURL(): string {
  // url encode rpcUrl and searchFallback
  return `${origin}/#go?q=%s`;
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
 *   description: 'Searches Google, add `i` for images',
 *   url: 'https://google.com/search?q=%@@@',
 *   subRoutes: [
 *     {
 *       command: 'i',
 *       url: 'https://google.com/search?tbm=isch&q=%@@@',
 *     },
 *   ],
 * };
 * const query = 'i something';
 * const { route, query } = traverseRoute(route, query);
 * console.log(routeData);
 * -> { command: 'i', ..., url: 'https://google.com/search?tbm=isch&q=%@@@' }
 * console.log(query);
 * -> 'something'
 */
export function traverseRoute(
  url: string,
  subRoutes: string[],
  query?: string
): { url: string; query?: string } {
  if (subRoutes.length === 0) {
    return { url, query };
  }
  const subcommand = query?.split(' ')[0];
  if (!subcommand || subcommand === '') {
    return { url, query };
  }

  const parsedSubRoutes = mapSubroutes(subRoutes);
  const subRoute = parsedSubRoutes.find((sr) => {
    return sr.command === subcommand;
  });
  if (!subRoute) {
    return { url, query };
  }

  const newUrl = subRoute.url;
  const newQuery = query.split(' ').slice(1).join(' ');
  return traverseRoute(newUrl, [], newQuery.trim());
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
 *   description: 'Searches Google, add `i` for images, `v` for video',
 *   url: 'https://google.com/search?q=%@@@',
 *   subRoutes: [
 *     {
 *       command: 'i',
 *       url: 'https://google.com/search?tbm=isch&q=%@@@',
 *     },
 *     {
 *        command: 'v',
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
export function getRouteUrl(route: Route, routeQuery: string): string {
  const { url, query } = traverseRoute(route.url, route.subRoutes, routeQuery);
  // return url encoded routeData.url and routeQuery
  return url.replace(
    SEARCH_REPLACEMENT,
    query ? encodeURIComponent(query) : ''
  );
}

/*
 * @function processQuery
 * Processes the query and returns the url.
 * @param database - The database used for the query
 * @param query - The query to process.
 * @param fallback - The fallback url.
 * @returns The url.
 *
 * @example
 * const query = 'g something';
 * console.log(processQuery(query, 'https://google.com/search?q=%@@@'));
 * -> 'https://google.com/search?q=something'
 */
export async function processQuery(
  db: (command: string) => Promise<Route | undefined>,
  query: string,
  fallback: string
) {
  const [command, substring] = [
    query.split(' ')[0],
    query.split(' ').slice(1).join(' ') ?? '',
  ];
  const route = await db(command);
  if (route) {
    return getRouteUrl(route, substring);
  }
  return fallback.replace(SEARCH_REPLACEMENT, query ?? '');
}
