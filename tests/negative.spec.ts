import { test, expect } from '../fixtures';
import { buildBooking } from '../data/booking';

const badToken = { Cookie: 'token=invalid' };

test.describe('Negative Test and Basic Security', () => {
  test('PUT with invalid token was rejected', async ({ api, booking }) => {
    const res = await api.update(booking.id, buildBooking(), badToken);
    expect(res.status()).toBe(403);
  });

  test('DELETE with invalid token was rejected', async ({ api, booking }) => {
    const res = await api.remove(booking.id, badToken);
    expect(res.status()).toBe(403);
  });

  test("id non-numeric doesn't make server error tidak membuat server error", async ({ api }) => {
    const res = await api.get('abc');
    expect(res.status()).toBeLessThan(500);
  });

  // eventhough we use HTML as an input, it's saved as is.
  test('input HTML was saved without sanity check', async ({ api }) => {
    const payload = '<script>alert(1)</script>';
    const res = await api.create(buildBooking({ lastname: payload }));
    expect(res.status()).toBe(200);
    expect((await res.json()).booking.lastname).toBe(payload);
  });
});