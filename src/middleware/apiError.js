

class APIError extends Error {
    constructor(statusCode) {
      super();
      this.statusCode = statusCode;
      this.errorCode = `ERR${statusCode}`;
    }
}
module.exports =  APIError;