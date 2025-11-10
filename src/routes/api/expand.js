{
  /**This route will return all the fragments for authenticated users */
}
const { Fragment } = require('../../model/fragments.js');
const express = require('express');
const router = express.Router();
const { createErrorResponse, createSuccessResponse } = require('../../response');
router.get('/v1/fragments/?expand=1', async (req, res) => {
  try {
    const fragments = await Fragment.byUser(req.user);
    const expandedFragments = [];
    for (const fragment of fragments) {
      const data = await fragment.getData();
      expandedFragments.push({
        id: fragment.id,
        type: fragment.type,
        size: fragment.size,
        created: fragment.created,
        updated: fragment.updated,
        data: data.toString(),
      });
    }
    const response = createSuccessResponse(
      { fragments: expandedFragments },
      'Fragments retrieved successfully'
    );
    return res.status(200).json(response);
  } catch (error) {
    const response = createErrorResponse(error + 'Internal Server Error');
    return res.status(500).json(response);
  }
});

module.exports = router;
