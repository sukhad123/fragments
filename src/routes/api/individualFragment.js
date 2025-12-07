const express = require('express');
const router = express.Router();
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const sharp = require('sharp');
const { Fragment } = require('../../model/fragments.js');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger.js');

// GET /v1/fragments/:id.:ext

router.get('/update/:id.:ext', async (req, res) => {
  try {
    logger.info('reaparams', req.params);
    const { id, ext } = req.params;
    logger.info(`Requested conversion of fragment ${id} to .${ext}`);

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const fragment = await Fragment.byId(req.user, id); // pass ownerId as first param

    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    const data = await fragment.getData();

    const mimeMap = {
      'text/plain': 'txt',
      'text/markdown': 'md',
      'text/html': 'html',
      'application/json': 'json',
      'application/xml': 'xml',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
      'image/tiff': 'tiff',
    };

    const originalExt = mimeMap[fragment.type] || null;
    const lowerExt = ext.toLowerCase();

    // Markdown → HTML
    if (fragment.type === 'text/markdown' && lowerExt === 'html') {
      const html = md.render(data.toString());
      return res.status(200).header('Content-Type', 'text/html').send(html);
    }

    // Image conversion
    const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'tiff'];
    if (fragment.type.startsWith('image/') && imageExts.includes(lowerExt)) {
      const outputType = lowerExt === 'jpg' ? 'jpeg' : lowerExt;
      try {
        const output = await sharp(data).toFormat(outputType).toBuffer();
        return res.status(200).header('Content-Type', `image/${outputType}`).send(output);
      } catch (err) {
        console.log(err);
        return res.status(415).json({ error: 'Image conversion failed' });
      }
    } else if (!fragment.type.startsWith('image/') && imageExts.includes(lowerExt)) {
      return res.status(415).json({ error: 'Cannot convert non-image fragment to image' });
    }

    // Return raw MIME if extension matches
    if (lowerExt === originalExt) {
      return res.status(200).header('Content-Type', fragment.type).send(data);
    }

    // Unsupported conversion
    return res.status(415).json({ error: 'Unsupported conversion requested' });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
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
    logger.error(err);
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
});

//Delete Router
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fragment = await Fragment.byId(req.user, id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    await Fragment.delete(req.user, id);
    return res.status(200).json(createSuccessResponse(null, 'Fragment deleted successfully'));
  } catch (err) {
    logger.error(err);
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
});

module.exports = router;
