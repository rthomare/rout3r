import { describe } from '@jest/globals';

import 'fake-indexeddb/auto';

import { createRouteDB } from '../../database/cacheDatabase';
import { getRouteUrl, processQuery } from '../engine';
import { RouteType } from '../types';

const googleRoute = {
  command: 'g',
  name: 'Google',
  description: 'Searches Google add `i` for images',
  url: 'https://www.google.com/search?q=%@@@',
  subRoutes: ['i::https://www.google.com/search?tbm=isch&q=%@@@'],
  isValue: true,
  routeType: RouteType.MANUAL,
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
  it('processes main routes correctly', async () => {
    const db = createRouteDB();
    await db.addRoute(googleRoute);
    const url = await processQuery(db, 'g something', FALLBACK);
    expect(url).toBe('https://www.google.com/search?q=something');
  });
  it('processes subroutes correctly', async () => {
    const db = createRouteDB();
    await db.addRoute(googleRoute);
    const url = await processQuery(db, 'g i something', FALLBACK);
    expect(url).toBe('https://www.google.com/search?tbm=isch&q=something');
  });
  it('processes subroute advanced query params', async () => {
    const db = createRouteDB();
    await db.addRoute(googleRoute);
    const url = await processQuery(db, 'g i something else', FALLBACK);
    expect(url).toBe(
      'https://www.google.com/search?tbm=isch&q=something%20else'
    );
  });
  it('processes subroutes with no query correctly', async () => {
    const db = createRouteDB();
    await db.addRoute(googleRoute);
    const url = await processQuery(db, 'g i', FALLBACK);
    expect(url).toBe('https://www.google.com/search?tbm=isch&q=');
  });
  it('processes fallback correctly', async () => {
    const db = createRouteDB();
    await db.addRoute(googleRoute);
    const url = await processQuery(db, 'something', FALLBACK);
    expect(url).toBe('https://duckduckgo.com/?&q=something');
  });
});
