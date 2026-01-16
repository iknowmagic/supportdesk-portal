import { describe, expect, it } from 'vitest';
import { router } from '../routes';

describe('routes', () => {
  it('defines the /inbox route', () => {
    expect(router.routesById['/inbox']).toBeDefined();
  });

  it('defines the /tickets/:id route', () => {
    expect(router.routesById['/tickets/$ticketId']).toBeDefined();
  });
});
