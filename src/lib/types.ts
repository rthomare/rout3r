/*
 * @type RouteData
 * The shape of the data that is stored in the database.
 * It contains the command, name, description, and url of the route.
 * @param command - The command that triggers the route.
 * @param name - The name of the route.
 * @param url - The url that the route redirects to.
 *
 * @example
 * {
 *  command: 'g',
 *  name: 'Google',
 *  url: 'https://www.google.com/search?q=%@@@',
 * }
 */
export type RouteData = {
  command: string;
  url: string;
};

/*
 * @type Route
 * The shape of the route object.
 * It contains the route data and an array of sub-routes.
 * @param subRoutes - An array of sub-routes.
 * @param description - The description of the route.
 *
 * @example
 * {
 *   command: 'g',
 *   name: 'Google',
 *   description: 'Searches Google',
 *   url: 'https://www.google.com/search?q=%@@@',
 *   subRoutes: [
 *     {
 *       command: 'i',
 *       name: 'Images',
 *       url: 'https://www.google.com/search?tbm=isch&q=%@@@',
 *     },
 *   ],
 * }
 */
export type Route = RouteData & {
  name: string;
  description: string;
  subRoutes: RouteData[];
};