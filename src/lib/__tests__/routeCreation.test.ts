import { describe, expect } from '@jest/globals';

import { createRouterURL } from '../engine';

describe('rout3r engine creation', () => {
  it('creates urls correctly', () => {
    const rpcUrl = 'http://localhost:8545';
    const searchFallback = 'https://google.com/search/?q=%@@@';
    const origin = 'http://localhost:3000';
    const expectedUrl = `${origin}/rout3r/#go?rpcUrl=${encodeURIComponent(
      rpcUrl
    )}&searchFallback=${encodeURIComponent(searchFallback)}&q=%s`;
    expect(createRouterURL(origin, searchFallback)).toBe(expectedUrl);
  });
});
