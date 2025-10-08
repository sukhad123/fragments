const express = require('express');
const router = express.Router();
const contentType = require('content-type');
const { Fragment } = require('../../model/fragments.js');
const { createSuccessResponse, createErrorResponse } = require('../../response.js');
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch (err) {
        console.error('Error parsing Content-Type:', err.message);
        return false;
      }
    },
  });

router.post('/', rawBody(), async (req, res) => {
  try {
    //Step 1: Extract the type
    const { type } = contentType.parse(req.headers['content-type']);
    //Step 2: Validate type
    if (!Fragment.isSupportedType(type)) {
      const response = createErrorResponse(415, `Unsupported Content-Type: ${type}`);
      return res.status(415).json(response);
    }
    //test the buffer body
    if (!Buffer.isBuffer(req.body)) {
      const response = createErrorResponse(415, 'Body is not a buffer');
      return res.status(415).json(response);
    }
    // Step 4: Create and store the fragment
    const fragment = new Fragment({
      ownerId: req.user,
      type,
    });
    await fragment.save();

    await fragment.setData(req.body);

    // Step 5: Build Location header
    const baseUrl = process.env.API_URL || `http://${req.headers.host}`;
    const location = `${baseUrl}/v1/fragments/${fragment.id}`;

    // Step 6: Respond success
    return res
      .set('Location', location)
      .status(200)
      .json(
        createSuccessResponse({
          fragment: {
            id: fragment.id,
            ownerId: fragment.ownerId,
            created: fragment.created,
            updated: fragment.updated,
            type: fragment.type,
            size: fragment.size,
          },
        })
      );

    //return res.status(22).json({ message: { type } });
  } catch (error) {
    console.log(error);
    const response = createErrorResponse(500, 'Internal Server Error');
    return res.status(500).json(response);
  }
  //return res.json({ message: 'POST /v1/fragments works!' });
});

module.exports = router;
