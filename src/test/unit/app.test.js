const request = require('supertest');
const app = require('../../app.js');
const { createErrorResponse } = require('../../response.js');
describe('App 404 test route', () => {
  // The status must be 404 unauthenticated as the route doesn't exists
  test('Status Code 404 Test', () => request(app).get('/undefinedRoute').expect(404));
  test('Error Response Structure', () => {
    const errorResponse = createErrorResponse(404, 'not found');
    // Expect the result to look like the following
    expect(errorResponse).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });
});
