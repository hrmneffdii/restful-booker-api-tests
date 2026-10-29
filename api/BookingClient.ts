import { APIRequestContext, APIResponse } from '@playwright/test';
import { Booking } from '../data/booking';
import { config } from '../data/config';

// Headers as key-value variable
type Headers = Record<string, string>;

export class BookingClient {
  private token?: string;
  private created: number[] = [];

  constructor(private request: APIRequestContext) {}

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  createToken(username = config.username, password = config.password): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      const res = await this.createToken();
      this.token = (await res.json()).token;
    }
    return this.token as string;
  }

  async authHeaders(): Promise<Headers> {
    return { Cookie: `token=${await this.getToken()}` };
  }

  basicAuthHeaders(): Headers {
    const raw = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    return { Authorization: `Basic ${raw}` };
  }

  list(params?: Record<string, string>) {
    return this.request.get('/booking', { params });
  }

  get(id: number | string) {
    return this.request.get(`/booking/${id}`);
  }

  // write id booking which successfully created
  async create(data: Booking | Record<string, unknown>): Promise<APIResponse> {
    const res = await this.request.post('/booking', { data });
    if (res.ok()) {
      const body = await res.json();
      if (typeof body.bookingid === 'number') this.created.push(body.bookingid);
    }
    return res;
  }

  update(id: number | string, data: Booking, headers: Headers = {}) {
    return this.request.put(`/booking/${id}`, { data, headers });
  }

  patch(id: number | string, data: Partial<Booking>, headers: Headers = {}) {
    return this.request.patch(`/booking/${id}`, { data, headers });
  }

  remove(id: number | string, headers: Headers = {}) {
    return this.request.delete(`/booking/${id}`, { headers });
  }

  async cleanup() {
    if (this.created.length === 0) return;
    const headers = await this.authHeaders();
    for (const id of this.created) {
      await this.request.delete(`/booking/${id}`, { headers });
    }
    this.created = [];
  }
}