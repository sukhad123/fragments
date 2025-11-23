// src/routes/index.js
const { hostname } = require('os');

const express = require('express');
//const app = require('../app');
const authenticate = require('../auth/auth-middleware.js');
const { author, version } = require('../../package.json');
// version and author from package.json
const { createSuccessResponse } = require('../response.js');

// version and author from package.json

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
// Define our first route, which will be: GET /v1/fragments
router.use(`/v1/fragments`, authenticate('http'), require('./api/get'));
router.use('/v1/fragments', authenticate('http'), require('./api/post'));
//unique id route
//individual fragment route
router.use('/v1/fragments', authenticate('http'), require('./api/individualFragment.js'));
// Create a router that we can use to mount our API
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');

  const data = {
    status: 'ok',
    author: author,
    version: version,
    // Use your own GitHub URL for this!
    githubUrl: 'https://github.com/sukhad123/fragments',
    hostname: hostname(),
  };
  const response = createSuccessResponse(data);
  res.status(200).json(response);
});
/**
 
/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */

module.exports = router;
