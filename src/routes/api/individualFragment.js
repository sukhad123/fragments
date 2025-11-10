const express = require('express');
const router = express.Router();
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

const { Fragment } = require('../../model/fragments.js');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// GET /v1/fragments/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const fragment = await Fragment.byId(req.user, id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment Not Found'));
    }

    const data = await fragment.getData();
    const response = createSuccessResponse(
      { fragment: data.toString() },
      'Fragment retrieved successfully'
    );

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
});

// GET /v1/fragments/:id/info
router.get('/:id/info', async (req, res) => {
  try {
    const { id } = req.params;
    const fragment = await Fragment.byId(req.user, id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const metadata = {
      id: fragment.id,
      type: fragment.type,
      size: fragment.size,
      created: fragment.created,
      updated: fragment.updated,
      ownerId: fragment.ownerId,
    };

    return res.status(200).json(createSuccessResponse(metadata, 'Fragment metadata retrieved'));
  } catch (err) {
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
});

// GET /v1/fragments/:id.:ext
router.get('/:id.:ext', async (req, res) => {
  try {
    const { id, ext } = req.params;
    const fragment = await Fragment.byId(req.user, id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const data = await fragment.getData();
    let outputData = data;

    // Markdown -> HTML conversion
    if (fragment.type === 'text/markdown' && ext === 'html') {
      outputData = md.render(data.toString());
      res.setHeader('Content-Type', 'text/html');
    } else {
      res.setHeader('Content-Type', fragment.type);
    }

    return res.status(200).send(outputData);
  } catch (err) {
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
});

module.exports = router;
