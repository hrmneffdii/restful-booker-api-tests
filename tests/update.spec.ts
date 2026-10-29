import { test, expect } from '../fixtures';
import { buildBooking } from '../data/booking';

test.describe('PUT and PATCH /booking/:id', () => {
  test('PUT change all the data booking with valid token credential @smoke', async ({ api, booking }) => {
    // build new data booking
    const updated = buildBooking({ firstname: 'Updated', totalprice: 999, depositpaid: false });

    // update the data booking with valid auth headers
    const res = await api.update(booking.id, updated, await api.authHeaders());

    // the respons status should be OK 200
    expect(res.status()).toBe(200);

    // expect that the newest data booking match with updated data booking in the system
    expect(await res.json()).toMatchObject({...updated});

    // recheck again
    const check = await api.get(booking.id);

    // newest data booking and updated data booking in the system are same
    expect(await check.json()).toMatchObject({...updated});
  });

  test('PUT works with basic auth', async ({ api, booking }) => {
    // updated data booking
    const updated = buildBooking({ firstname: 'ViaBasic' });

    // PUT data booking become newes
    const res = await api.update(booking.id, updated, api.basicAuthHeaders());

    // respons status should be 200
    expect(res.status()).toBe(200);

    // data booking is updated correctly
    expect(await res.json()).toMatchObject({ firstname: 'ViaBasic' });
  });

  test('PATCH only changes field which be sent', async ({ api, booking }) => {
    // field changes
    const patch = { firstname: 'Patched', additionalneeds: 'Dinner' };

    // PATCH action
    const res = await api.patch(booking.id, patch, await api.authHeaders());

    // status should be 200
    expect(res.status()).toBe(200);

    // data booking has value as expected
    expect(await res.json()).toMatchObject({ ...booking.data, ...patch });
  });

  test('PUT without valid credentials is rejected (403)', async ({ api, booking }) => {
    const res = await api.update(booking.id, buildBooking());
    expect(res.status()).toBe(403);
  });
});