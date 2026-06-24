export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }

  static ok(res, data, message) {
    return new ApiResponse(200, data, message).send(res);
  }

  static created(res, data, message = 'Created') {
    return new ApiResponse(201, data, message).send(res);
  }

  static noContent(res) {
    return res.status(204).end();
  }
}
