class ReqError extends Error {
  constructor(statusCode=400, ...params) {
    super(...params);
    this.statusCode = statusCode;
  }

  static getErrMessage(err) {
    console.log(err.message);
    return (err instanceof ReqError ? err.message : 'An unexpected internal error happens');
  }
}

export default ReqError;