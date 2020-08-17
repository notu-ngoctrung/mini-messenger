/* eslint-disable max-len */
/**
 * An Error class to handle bad HTTP requests
 */
class ReqError extends Error {
  /**
   * ReqError constructor
   * @param {number} statusCode status code to response to clients
   * @param  {...any} params params matched with Error class
   */
  constructor(statusCode=400, ...params) {
    super(...params);
    this.statusCode = statusCode;
  }

  /**
   * Handles error messages in error instances
   * @param {Error} err an error
   * @return {string} reasonable, safe error messages
   */
  static getErrMessage(err) {
    console.log(err.message);
    return (err instanceof ReqError ? err.message : 'An unexpected internal error happens');
  }
}

export default ReqError;
