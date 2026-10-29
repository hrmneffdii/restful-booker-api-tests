import { test, expect } from '../fixtures';
import { buildBooking } from '../data/booking';

// Known API issues are documented with test.fail():
//   - the test PASSES while the issue still exists
//   - the test FAILS once the API is fixed, or if its real behaviour differs
//     from what is described in bug-reports/
// When a test starts failing, verify the response in Postman, then either update
// the bug report or remove test.fail() and keep the test as a regression check.
test.describe('Known API issues', () => {
  test('API-001: wrong credentials should return a 4xx status', async ({ api }) => {
    test.fail(true, 'API-001: POST /auth returns 200 for wrong credentials');
    const res = await api.createToken('admin', 'wrong123');
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  for (const field of ['firstname', 'lastname', 'bookingdates']) {
    test(`API-002: missing required field ${field} should return a 4xx status`, async ({ api }) => {
      test.fail(true, 'API-002: POST /booking returns 500 for missing required fields');
      const payload: Record<string, unknown> = { ...buildBooking() };
      delete payload[field];
      const res = await api.create(payload);
      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
    });
  }

  test('API-003: deleting a non-existent booking should return 404', async ({ api }) => {
    test.fail(true, 'API-003: DELETE /booking/:id returns 405 for a non-existent id');
    const res = await api.remove(999999999, await api.authHeaders());
    expect(res.status()).toBe(404);
  });
});