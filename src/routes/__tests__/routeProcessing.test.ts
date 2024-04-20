import { describe } from '@jest/globals';

import { getRouteUrl } from '../engine';

const googleRoute = {
  command: 'g',
  name: 'Google',
  description: 'Searches Google',
  url: 'https://www.google.com/search?q=%@@@',
  subRoutes: [
    {
      command: 'i',
      name: 'Images',
      description: 'Searches Google Images',
      url: 'https://www.google.com/search?tbm=isch&q=%@@@',
      subRoutes: [],
    },
  ],
};

describe('rout3r engine processing', () => {
  it('processes main routes correctly', () => {
    const url = getRouteUrl(googleRoute, 'something');
    expect(url).toBe('https://www.google.com/search?q=something');
  });
  it('processes subroutes correctly', () => {
    const url = getRouteUrl(googleRoute, 'i something');
    expect(url).toBe('https://www.google.com/search?tbm=isch&q=something');
  });
  it('processes subroutes correctly and advanced query paraemters', () => {
    const url = getRouteUrl(googleRoute, 'i something else');
    expect(url).toBe(
      'https://www.google.com/search?tbm=isch&q=something%20else'
    );
  });
  it('processes subroutes with no query correctly', () => {
    const url = getRouteUrl(googleRoute, 'i');
    expect(url).toBe('https://www.google.com/search?tbm=isch&q=');
  });
});
