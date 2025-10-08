// src/test/unit/post.test.js

const request = require('supertest');
const app = require('../../app.js'); // adjust path if needed
const { Fragment } = require('../../model/fragments.js');

// Mock the Fragment model methods to isolate the route
jest.mock('../../model/fragments.js', () => {
  const mockFragment = jest.fn().mockImplementation(({ ownerId, type }) => ({
    id: 'mock-id',
    ownerId,
    type,
    size: 11,
    save: jest.fn().mockResolvedValue(),
    setData: jest.fn().mockResolvedValue(),
  }));

  mockFragment.isSupportedType = jest.fn((type) =>
    ['text/plain', 'application/json'].includes(type)
  );

  return { Fragment: mockFragment };
});

describe('POST /v1/fragments', () => {
  // Unauthenticated requests should be denied
  test('unauthenticated requests are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(401);
  });

  // Incorrect credentials should be denied
  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('wrong@email.com', 'badpass')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(401);
  });

  // Unsupported Content-Type should return 415
  test('unsupported Content-Type returns 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send('fakeimagebinary');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  // Successful fragment creation
  test('authenticated users can create a text/plain fragment', async () => {
    Fragment.isSupportedType.mockReturnValueOnce(true);

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('hello world');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.headers.location).toContain('/v1/fragments/mock-id');
  });

  // JSON fragment creation
  test('authenticated users can create a JSON fragment', async () => {
    Fragment.isSupportedType.mockReturnValueOnce(true);

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ key: 'value' }));

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.type).toBe('application/json');
  });

  // Large body test (boundary)
  test('handles up to 5mb payload correctly', async () => {
    Fragment.isSupportedType.mockReturnValueOnce(true);
    const largeBody = Buffer.alloc(1024 * 1024 * 5, 'a'); // 5MB

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(largeBody);

    expect([200, 413]).toContain(res.statusCode);
  });
});
