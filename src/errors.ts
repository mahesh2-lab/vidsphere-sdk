export class VidSphereError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VidSphereError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends VidSphereError {
  constructor(message = "API key is missing or invalid") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class UploadError extends VidSphereError {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

export class NetworkError extends VidSphereError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends VidSphereError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
