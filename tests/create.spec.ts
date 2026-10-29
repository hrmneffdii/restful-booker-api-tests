import { test, expect } from '../fixtures';
import { buildBooking } from '../data/booking';
import { createResponseSchema } from '../schemas/booking.schema';
import { expectValidSchema } from '../utils/schema';

test.describe('POST /booking', () => {
  test('create booking and returnd id @smoke', async ({ api }) => {
    // create data/body booking to book in POST method
    const data = buildBooking();

    // execution of booking as POST method
    const res = await api.create(data);

    // respon as result execution should be success
    expect(res.status()).toBe(200);

    // convert respon from APIResponses<any> to JSON format
    const body = await res.json();

    // expect that bookingid is a number
    expect(body.bookingid).toEqual(expect.any(Number));

    // expect that all data responses match the data sent
    expect(body.booking).toMatchObject({...data});
  });

  test('create responses according schema', async ({ api }) => {
    // create a booking in POST method
    const res = await api.create(buildBooking());

    // expect responses has valid schema
    expectValidSchema(createResponseSchema, await res.json());
  });

  test('data can be read again', async ({ api }) => {
    // build data booking with different value against default
    const data = buildBooking({ totalprice: 1234, depositpaid: false });
    
    // put bookingid value
    const { bookingid } = await (await api.create(data)).json();

    // get data booking from system
    const res = await api.get(bookingid);

    // expect that data booking in system is matched with our's data booking
    expect(await res.json()).toMatchObject({...data});
  });

  test('create booking has different result id', async ({ api }) => {
    // create booking activity a
    const a = await (await api.create(buildBooking())).json();

    // create booking activity b
    const b = await (await api.create(buildBooking())).json();

    // expect that the system returns different value of bookingid
    expect(a.bookingid).not.toBe(b.bookingid);
  });
});