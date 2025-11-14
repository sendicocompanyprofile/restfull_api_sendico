/**
 * Custom ResponseError class for API error handling
 * Extends Error and adds status code and message properties
 */
export class ResponseError extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;

    // Set prototype for instanceof checks
    Object.setPrototypeOf(this, ResponseError.prototype);
  }
}
