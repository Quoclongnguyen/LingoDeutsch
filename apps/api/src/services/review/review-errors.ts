export class ReviewSessionNotFoundError extends Error {
  constructor() {
    super("Review session was not found for the authenticated user.");
    this.name = "ReviewSessionNotFoundError";
  }
}

export class ReviewSessionStateError extends Error {
  constructor(message = "The review session cannot accept this operation.") {
    super(message);
    this.name = "ReviewSessionStateError";
  }
}

export class ReviewEventConflictError extends Error {
  constructor() {
    super("The review event identifier belongs to another operation.");
    this.name = "ReviewEventConflictError";
  }
}
