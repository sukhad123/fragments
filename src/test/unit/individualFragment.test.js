const request = require('supertest');
const app = require('../../app');
const { Fragment } = require('../../model/fragments');
const { createErrorResponse } = require('../../response');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

jest.mock('../../model/fragments', () => ({
  Fragment: {
    byId: jest.fn(),
  },
}));

jest.mock('../../response', () => ({
  createSuccessResponse: jest.fn((data, msg) => ({ status: 'ok', ...data, message: msg })),
  createErrorResponse: jest.fn((code, msg) => ({ status: 'error', code, error: msg })),
}));

describe('Fragments API Routes', () => {
  const validUser = { email: 'user1@email.com', password: 'password1' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  /** ================= GET /v1/fragments/:id ================= */
  describe('GET /v1/fragments/:id', () => {
    test('returns 404 if fragment not found', async () => {
      Fragment.byId.mockResolvedValue(null);
      const res = await request(app)
        .get('/v1/fragments/does-not-exist')
        .auth(validUser.email, validUser.password);

      expect(res.statusCode).toBe(404);
      expect(createErrorResponse).toHaveBeenCalledWith(404, 'Fragment Not Found');
    });

    test('returns 200 and fragment data if found', async () => {
      const mockFragment = { getData: jest.fn().mockResolvedValue(Buffer.from('Hello world')) };
      Fragment.byId.mockResolvedValue(mockFragment);

      const res = await request(app)
        .get('/v1/fragments/12345')
        .auth(validUser.email, validUser.password);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toBe('Hello world');
    });

    test('returns 500 if getData throws', async () => {
      const mockFragment = { getData: jest.fn().mockRejectedValue(new Error('Read failed')) };
      Fragment.byId.mockResolvedValue(mockFragment);

      const res = await request(app)
        .get('/v1/fragments/12345')
        .auth(validUser.email, validUser.password);

      expect(res.statusCode).toBe(500);
    });
  });

  /** ================= GET /v1/fragments/:id/info ================= */
  describe('GET /v1/fragments/:id/info', () => {
    test('returns 404 if fragment not found', async () => {
      Fragment.byId.mockResolvedValue(null);
      const res = await request(app)
        .get('/v1/fragments/does-not-exist/info')
        .auth(validUser.email, validUser.password);

      expect(res.statusCode).toBe(404);
    });

    test('returns 200 and metadata if fragment exists', async () => {
      const mockFragment = {
        id: 'frag1',
        type: 'text/plain',
        size: 10,
        created: '2025-11-10T03:32:32.851Z',
        updated: '2025-11-10T03:32:32.851Z',
        ownerId: 'owner1',
      };
      Fragment.byId.mockResolvedValue(mockFragment);

      const res = await request(app)
        .get('/v1/fragments/frag1/info')
        .auth(validUser.email, validUser.password);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.id).toBe('frag1');
    });
  });

  /** ================= GET /v1/fragments/:id.:ext ================= */
  describe('GET /v1/fragments/:id.:ext', () => {
    test('returns 404 if fragment not found', async () => {
      Fragment.byId.mockResolvedValue(null);
      const res = await request(app)
        .get('/v1/fragments/12345.html')
        .auth(validUser.email, validUser.password);
      expect(res.statusCode).toBe(404);
    });

    test('returns 200 and converts markdown to HTML', async () => {
      const markdown = '# Title';
      const mockFragment = {
        getData: jest.fn().mockResolvedValue(Buffer.from(markdown)),
        type: 'text/markdown',
      };
      Fragment.byId.mockResolvedValue(mockFragment);

      const res = await request(app)
        .get('/v1/fragments/12345.html')
        .auth(validUser.email, validUser.password);

      expect(res.statusCode).toBe(200);

      // Parse JSON returned by the app
      const body = JSON.parse(res.text);
      expect(md.render(body.fragment).trim()).toBe(md.render(markdown).trim());
      expect(res.header['content-type']).toMatch(/json/);
    });

    test('returns 200 and original data if conversion not supported', async () => {
      const data = 'Plain text';
      const mockFragment = {
        getData: jest.fn().mockResolvedValue(Buffer.from(data)),
        type: 'text/plain',
      };
      Fragment.byId.mockResolvedValue(mockFragment);

      const res = await request(app)
        .get('/v1/fragments/12345.txt')
        .auth(validUser.email, validUser.password);

      expect(res.statusCode).toBe(200);

      const body = JSON.parse(res.text);
      expect(body.fragment).toBe(data);
      expect(res.header['content-type']).toMatch(/json/);
    });
  });
});
