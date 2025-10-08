// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../app.js');
const { Fragment } = require('../../model/fragments');

jest.mock('../../model/fragments', () => ({
  Fragment: {
    byUser: jest.fn(),
  },
}));

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    Fragment.byUser.mockResolvedValueOnce([{ id: '1', type: 'text/plain', size: 5 }]);

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.Fragments)).toBe(true);
    expect(res.body.Fragments.length).toBeGreaterThanOrEqual(1);
    expect(res.body.Fragments[0]).toMatchObject({
      id: '1',
      type: 'text/plain',
    });
  });

  // Check if empty fragments array is handled correctly
  test('authenticated user with no fragments gets an empty array', async () => {
    Fragment.byUser.mockResolvedValueOnce([]);

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.Fragments).toEqual([]);
  });

  // Ensure correct JSON structure in success response
  test('response format is valid JSON', async () => {
    Fragment.byUser.mockResolvedValueOnce([{ id: 'a', type: 'text/plain', size: 10 }]);

    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('Fragments');
  });
});
