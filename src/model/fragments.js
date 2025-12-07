// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data/aws/index.js');

//Defining a fragment
class Fragment {
  constructor({
    id = randomUUID(),
    ownerId,
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
    type,
    size = 0,
  }) {
    // ownerId and type are mandatory
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }

    // Validate that size is a number and not negative
    if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) {
      throw new Error('size must be a non-negative number');
    }

    // Check that the type is supported
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported type: ${type}`);
    }

    // Assign properties
    this.id = id;
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    if (!ownerId) {
      throw new Error('Missing owner id');
    }

    const fragments = await listFragments(ownerId, expand);

    // If expand = true → parse and re-create Fragment instances
    if (expand) {
      return fragments.map((fragment) => {
        const data = typeof fragment === 'string' ? JSON.parse(fragment) : fragment;
        return new Fragment({
          id: data.id,
          ownerId: data.ownerId,
          created: data.created,
          updated: data.updated,
          type: data.type,
          size: data.size,
        });
      });
    }

    return fragments;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    if (!ownerId || !id) {
      return null;
    }

    const response = await readFragment(ownerId, id);

    if (!response) {
      // Return null if fragment doesn't exist
      return null;
    }

    let parsed;
    try {
      parsed = typeof response === 'string' ? JSON.parse(response) : response;
    } catch (err) {
      console.log(err);
      throw new Error('Failed to parse fragment from DB');
    }

    const fragment = new Fragment({
      id: parsed.id,
      ownerId: parsed.ownerId,
      type: parsed.type,
      created: parsed.created,
      updated: parsed.updated,
      size: parsed.size,
    });

    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    if (!ownerId || !id) {
      throw new Error('Missing owner Id or id');
    }
    deleteFragment(ownerId, id);
    return Promise.resolve();
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    const data = readFragmentData(this.ownerId, this.id);
    return Promise.resolve(data);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    // Write data and update metadata
    await writeFragmentData(this.ownerId, this.id, data);
    this.size = data.length;
    this.updated = new Date().toISOString();
    await writeFragment(this);

    // TODO
    // TIP: make sure you update the metadata whenever you change the data, so they match
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const type = this.mimeType;
    const formats = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'application/json': ['application/json', 'text/plain'],
    };
    return formats[type] || [type];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    const supported = [
      'text/csv',
      'text/plain',
      'text/markdown',
      'text/html',
      'application/json',
      'application/yaml',
      'image/png',
      'image/jpeg',
      'image/webp',
    ];
    return supported.includes(type);
  }
}

module.exports.Fragment = Fragment;
