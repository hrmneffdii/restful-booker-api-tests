import { test, expect } from '../fixtures';
import { bookingSchema } from '../schemas/booking.schema';
import { expectValidSchema } from '../utils/schema';

test.describe('GET /booking', () => {
  test('register booking returns an id booking @smoke', async ({ api }) => {
    // lots of booking id as array
    const res = await api.list();
    
    // expect status of response is 200
    expect(res.status()).toBe(200);

    // converting respon into json
    const body = await res.json();

    // expect that the body is array
    expect(Array.isArray(body)).toBe(true);

    // xpect that the array has length more than 0
    expect(body.length).toBeGreaterThan(0);

    // expect that first array element contains number
    expect(body[0]).toEqual({ bookingid: expect.any(Number) });
  });

  test('filter firstname can find a booking which created', async ({ api, booking }) => {
    // booking fixtures finished a booking process, only check the booking id which regitered
    const res = await api.list({ firstname: booking.data.firstname });

    // checking status response
    expect(res.status()).toBe(200);

    // respon booking id from system should be same with booking.id
    expect(await res.json()).toContainEqual({ bookingid: booking.id });
  });

  test('GET by id returns correct data', async ({ api, booking }) => {
    // response contains bookingid and booking data
    const res = await api.get(booking.id);

    // status responses check
    expect(res.status()).toBe(200);

    // booking data should be correct data
    expect(await res.json()).toMatchObject({...booking.data});
  });

  test('respons GET by id should have valid schema', async ({ api, booking }) => {
    // get booking data
    const res = await api.get(booking.id);

    // respons should have valid schema as booking schema
    expectValidSchema(bookingSchema, await res.json());
  });

  test('id which not registered should be returned 404 status', async ({ api }) => {
    // get random booking id
    const res = await api.get(999999999);

    // expect that the status respons is 404
    expect(res.status()).toBe(404);
  });
});