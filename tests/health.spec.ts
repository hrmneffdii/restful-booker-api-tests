import { test, expect } from '../fixtures';

test('GET /ping: service on @smoke', async ({ api }) => {
  const res = await api.ping();
  expect(res.status()).toBe(201);
});