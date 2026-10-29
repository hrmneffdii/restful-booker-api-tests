import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import { Booking, buildBooking } from '../data/booking';

type Fixtures = {
  api: BookingClient;
  booking: { id: number; data: Booking };
};

export const test = base.extend<Fixtures>({
  // serving client and cleaning all data which made after test.
  api: async ({ request }, use) => {
    const client = new BookingClient(request);
    await use(client);
    await client.cleanup();
  },

  // booking lifecycle, fixtures 'api' was preceded above
  booking: async ({ api }, use) => {
    const data = buildBooking();
    const res = await api.create(data);
    expect(res.status()).toBe(200);
    const { bookingid } = await res.json();
    await use({ id: bookingid, data });
  },
});

export { expect };