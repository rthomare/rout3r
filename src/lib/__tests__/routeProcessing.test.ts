import { describe } from '@jest/globals';

import 'fake-indexeddb/auto';

import { createRouteDB } from '../database';
import { getRouteUrl, processQuery } from '../engine';

const googleRoute = {
  command: 'g',
  name: 'Google',
  description: 'Searches Google add `i` for images',
  url: 'https://www.google.com/search?q=%@@@',
  subRoutes: [
    {
      command: 'i',
      url: 'https://www.google.com/search?tbm=isch&q=%@@@',
    },
  ],
};

const FALLBACK = 'https://duckduckgo.com/?&q=%@@@';

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

describe('rout3r engine processing with database', () => {
  beforeAll(async () => {
    // setup database
    const db = createRouteDB();
    await db.addRoute(googleRoute);
  });
  it('processes main routes correctly', async () => {
    const url = await processQuery('g something', FALLBACK);
    expect(url).toBe('https://www.google.com/search?q=something');
  });
  it('processes subroutes correctly', async () => {
    const url = await processQuery('g i something', FALLBACK);
    expect(url).toBe('https://www.google.com/search?tbm=isch&q=something');
  });
  it('processes subroute advanced query params', async () => {
    const url = await processQuery('g i something else', FALLBACK);
    expect(url).toBe(
      'https://www.google.com/search?tbm=isch&q=something%20else'
    );
  });
  it('processes subroutes with no query correctly', async () => {
    const url = await processQuery('g i', FALLBACK);
    expect(url).toBe('https://www.google.com/search?tbm=isch&q=');
  });
  it('processes fallback correctly', async () => {
    const url = await processQuery('something', FALLBACK);
    expect(url).toBe('https://duckduckgo.com/?&q=something');
  });
});
