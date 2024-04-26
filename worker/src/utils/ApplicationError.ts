import { ErrorCode, ERRORS, ErrorTypes } from "./Errors";

type ApplicationErrorOptions = {
  isOperational: boolean;
  exposeToClient: boolean;
};

const defaultOptions: ApplicationErrorOptions = {
  isOperational: true,
  exposeToClient: true,
};

export class ApplicationError extends Error {
  /**
   * Notarial-API error code to help identify the error and resolve it
   */
  code: ErrorCode;

  isOperational: boolean = true;

  constructor(name: ErrorTypes, code: ErrorCode, message?: string, options?: Partial<ApplicationErrorOptions>) {
    super(message);
    this.name = name;
    this.code = code;
    this.message = message ?? ERRORS[name][code];
    const { isOperational } = { ...defaultOptions, ...options };
    this.isOperational = isOperational;
  }
}
