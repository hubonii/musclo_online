/**
 * Shared test helpers for Express request/response mocking.
 */

/**
 * Build a mock Express response object for unit tests.
 * @returns {Object} Mocked response object with chained methods.
 */
function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    attachment: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
  };
}

module.exports = {
  createRes,
};
