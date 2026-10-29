import { test, expect } from '../fixtures';
import { tokenSchema } from '../schemas/booking.schema';
import { expectValidSchema } from '../utils/schema';

test.describe('POST /auth', () => {
  test('valid credential return token @smoke', async ({ api }) => {
    // create token
    const res = await api.createToken();

    // ecpect that status respon is ok
    expect(res.status()).toBe(200);

    // converting res type from APIResponse<any> to JSON format
    const body = await res.json();

    // expect token should be string value
    expect(typeof body.token).toBe('string');

    // expect expect token length is longer than 5
    expect(body.token.length).toBeGreaterThan(5);
  });

  test('respons token according to the schema', async ({ api }) => {
    // create token value
    const res = await api.createToken();

    // token value should be match with token schema
    expectValidSchema(tokenSchema, await res.json());
  });

  test("wrong password doesn't return token", async ({ api }) => {
    // create token
    const res = await api.createToken('admin', 'salah123');

    // returning a respon as convert into JSON
    const body = await res.json();

    // token wasn't creted as it doesn't have value (undefined)
    expect(body.token).toBeUndefined();

    // expect reason is bad credentials
    expect(body.reason).toBe('Bad credentials');
  });
});