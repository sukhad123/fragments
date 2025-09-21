// src/routes/index.js

const express = require('express');
//const app = require('../app');
const { authenticate } = require('../auth');
// version and author from package.json

// version and author from package.json

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
// Define our first route, which will be: GET /v1/fragments
router.use(`/v1/fragments`, authenticate(), require('./api/get'));
// Other routes (POST, DELETE, etc.) will go here later on...

// Create a router that we can use to mount our API
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json({
    status: 'ok',

    // Use your own GitHub URL for this!
    githubUrl: 'https://github.com/sukhad123/fragments',
  });
});
/**
 
/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */

module.exports = router;
