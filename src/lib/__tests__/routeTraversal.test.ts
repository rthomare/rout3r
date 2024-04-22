import { describe, expect } from '@jest/globals';

import { traverseRoute } from '../engine';

const googleRoute = {
  command: 'g',
  name: 'Google',
  description: 'Searches Google',
  url: 'https://www.google.com/search?q=%@@@',
  subRoutes: [
    {
      command: 'i',
      url: 'https://www.google.com/search?tbm=isch&q=%@@@',
    },
  ],
};

describe('rout3r engine traversal', () => {
  it('traverses routes correctly', () => {
    const { routeData, routeQuery } = traverseRoute(googleRoute, 'i something');
    expect(routeData).toEqual({
      command: 'i',
      url: 'https://www.google.com/search?tbm=isch&q=%@@@',
    });
    expect(routeQuery).toBe('something');
  });
  it('traverses routes correctly with no subcommand', () => {
    const query = '';
    const { routeData, routeQuery } = traverseRoute(googleRoute, query);
    expect(routeData).toEqual({
      command: 'g',
      url: 'https://www.google.com/search?q=%@@@',
    });
    expect(routeQuery).toBe('');
  });
  it('traverses routes correctly with no subroutes', () => {
    const { routeData, routeQuery } = traverseRoute(
      { ...googleRoute.subRoutes[0], subRoutes: [] },
      'i something'
    );
    expect(routeData).toEqual({
      command: 'i',
      url: 'https://www.google.com/search?tbm=isch&q=%@@@',
    });
    expect(routeQuery).toBe('i something');
  });
  it('traverses routes correctly with no subcommand and no subroutes', () => {
    const { routeData, routeQuery } = traverseRoute(
      { ...googleRoute.subRoutes[0], subRoutes: [] },
      ''
    );
    expect(routeData).toEqual({
      command: 'i',
      url: 'https://www.google.com/search?tbm=isch&q=%@@@',
    });
    expect(routeQuery).toBe('');
  });
});
