class ReqError extends Error {
  constructor(statusCode=400, ...params) {
    super(...params);
    this.statusCode = statusCode;
  }
}

export default ReqError;