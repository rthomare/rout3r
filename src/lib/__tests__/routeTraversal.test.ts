import { describe, expect, it } from 'vitest';

import { traverseRoute } from '../engine';
import { RouteType } from '../types';

const googleRoute = {
  command: 'g',
  name: 'Google',
  description: 'Searches Google',
  url: 'https://www.google.com/search?q=%@@@',
  subRoutes: ['i::https://www.google.com/search?tbm=isch&q=%@@@'],
  routeType: RouteType.MANUAL,
};

describe('rout3r engine traversal', () => {
  it('traverses routes correctly', () => {
    const { url, query } = traverseRoute(
      googleRoute.url,
      googleRoute.subRoutes,
      'i something'
    );
    expect(url).toEqual('https://www.google.com/search?tbm=isch&q=%@@@');
    expect(query).toBe('something');
  });
  it('traverses routes correctly with no subcommand', () => {
    const { url, query } = traverseRoute(
      googleRoute.url,
      googleRoute.subRoutes,
      ''
    );
    expect(url).toEqual('https://www.google.com/search?q=%@@@');
    expect(query).toBe('');
  });
  it('traverses routes correctly with no subroutes', () => {
    const { url, query } = traverseRoute(
      'https://www.google.com/search?tbm=isch&q=%@@@',
      [],
      'i something'
    );
    expect(url).toEqual('https://www.google.com/search?tbm=isch&q=%@@@');
    expect(query).toBe('i something');
  });
  it('traverses routes correctly with no subcommand and no subroutes', () => {
    const { url, query } = traverseRoute(
      'https://www.google.com/search?tbm=isch&q=%@@@',
      [],
      ''
    );
    expect(url).toEqual('https://www.google.com/search?tbm=isch&q=%@@@');
    expect(query).toBe('');
  });
});
