import { ZodError, ZodIssue } from "zod";
import { httpstatus } from "./ctx";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class DuplicateEntryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateEntryError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export const handleErrors = (err: Error) => {
  if (err instanceof NotFoundError) {
    return {
      type: "Not Found Error",
      error: err.message,
      status: httpstatus.NOT_FOUND,
    };
  }

  if (err instanceof DuplicateEntryError) {
    return {
      type: "Duplicate Entry Error",
      error: err.message,
      status: httpstatus.CONFLICT,
    };
  }

  if (err instanceof ZodError) {
    const errorMessages: string[] = [];
    for (let i = 0; i < err.errors.length; i++) {
      errorMessages.push(err.errors[i].message);
    }

    return {
      type: "Validation Error",
      error: errorMessages,
      status: httpstatus.BAD_REQUEST,
    };
  }
  return {
    type: "Internal Server Error",
    error: ` ${err.message}`,
    status: httpstatus.INTERNAL_SERVER_ERROR,
  };
};
