const express = require('express');
const router = express.Router();
const { Fragment } = require('../../model/fragments.js');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger.js');
router.get('/', async (req, res) => {
  try {
    //Gather user Fragment Id
    const fragments = await Fragment.byUser(req.user);
    const response = createSuccessResponse({ Fragments: fragments });
    //return a success response
    return res.status(200).json(response);
  } catch (error) {
    logger(error);
    //Handle any server error
    const response = createErrorResponse(500, 'Internal Server Error');
    //return the response
    return res.status(500).json(response);
  }
});

module.exports = router;
