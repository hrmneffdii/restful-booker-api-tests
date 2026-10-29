import { test, expect } from '../fixtures';

test.describe('DELETE /booking/:id', () => {
  test('remove functionality works properly @smoke', async ({ api, booking }) => {
    // before doing api.remove, the system finished booking activities 
    // as booking fixtures could be used
    const res = await api.remove(booking.id, await api.authHeaders());
    
    // success delete returning status 201 
    expect(res.status()).toBe(201);

    // after DELETE method in api.remove, booking data couldn't be used
    const after = await api.get(booking.id);

    // expect that status not found 404
    expect(after.status()).toBe(404);
  });

  test('remove without credentials is rejected and the data still remain', async ({ api, booking }) => {
    // try to remove booking without credentials
    const res = await api.remove(booking.id);

    // response status 403 
    expect(res.status()).toBe(403);

    // check booking in system with booking id  
    const after = await api.get(booking.id);

    // expect that status 200 / OK as the data booking still remain in system
    expect(after.status()).toBe(200);
  });
});