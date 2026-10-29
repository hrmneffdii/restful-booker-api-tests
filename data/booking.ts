// Booking interface to arrange body JSON for POST request
export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
}

// unique name to make easier searching 
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return {
    firstname: `Budi${suffix}`,
    lastname: 'Santoso',
    totalprice: 500,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-15' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}