const express = require('express');
const router = express.Router();

const { Fragment } = require('../../model/fragments.js');
const { createSuccessResponse, createErrorResponse } = require('../../response');
router.get('/:id', async (req, res) => {
  try {
    //Step 1: Extracts the id
    const id = req.params.id;
    const fragment = await Fragment.byId(req.user, id);
    if (!fragment) {
      const errorResponse = createErrorResponse('Fragment Not Found');
      res.status(404).json(errorResponse);
    }

    const data = await fragment.getData();
    const response = createSuccessResponse(
      { fragment: data.toString() },
      'Fragment retrieved successfully'
    );
    return res.status(200).json(response);
  } catch (error) {
    //Handle any server error
    const response = createErrorResponse(error + 'Internal Server Error');
    //return the response
    return res.status(500).json(response);
  }
});

module.exports = router;
