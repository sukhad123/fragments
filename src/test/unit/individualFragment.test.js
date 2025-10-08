const request = require('supertest');
const app = require('../../app');
const { Fragment } = require('../../model/fragments');

jest.mock('../../model/fragments', () => ({
  Fragment: {
    byId: jest.fn(),
  },
}));

describe('GET /v1/fragments/:id', () => {
  const validUser = { email: 'user1@email.com', password: 'password1' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments/12345');
    expect(res.statusCode).toBe(401);
  });

  test('requests with invalid credentials are denied', async () => {
    const res = await request(app)
      .get('/v1/fragments/12345')
      .auth('invalid@email.com', 'wrong_password');
    expect(res.statusCode).toBe(401);
  });

  test('returns 404 if fragment not found', async () => {
    Fragment.byId.mockImplementation(() => {
      const err = new Error('Fragment not found');
      err.code = 'ENOENT';
      throw err;
    });

    const res = await request(app)
      .get('/v1/fragments/does-not-exist')
      .auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(500);
  });

  test('returns 500 if there is a server error', async () => {
    Fragment.byId.mockRejectedValue(new Error('Database connection failed'));

    const res = await request(app)
      .get('/v1/fragments/12345')
      .auth(validUser.email, validUser.password);
    expect(res.statusCode).toBe(500);
  });
  test('returns 200 and fragment data when found', async () => {
    const mockFragment = {
      getData: jest.fn().mockResolvedValue(Buffer.from('Hello world')),
    };

    Fragment.byId.mockResolvedValue(mockFragment);

    const res = await request(app)
      .get('/v1/fragments/12345')
      .auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBe('Hello world');
    expect(Fragment.byId).toHaveBeenCalledWith(expect.any(String), '12345');
  });
});
