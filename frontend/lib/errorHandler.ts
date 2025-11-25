/**
 * Error handling utilities for API responses
 */

export interface ApiError {
  title: string;
  message: string;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
}

/**
 * Extract error message from Axios error response
 */
export function extractErrorMessage(error: any): ApiError {
  const defaultError: ApiError = {
    title: "Error",
    message: "An unexpected error occurred. Please try again.",
  };

  // Network error (no response from server)
  if (!error.response) {
    return {
      title: "Network Error",
      message: error.message || "Unable to connect to the server. Please check your internet connection.",
    };
  }

  const { status, data } = error.response;
  const errorData = data || {};

  // Initialize result
  const result: ApiError = {
    title: "Error",
    message: defaultError.message,
    statusCode: status,
    fieldErrors: {},
  };

  // Extract main error message
  if (errorData.error) {
    result.message = errorData.error;
  } else if (errorData.detail) {
    result.message = errorData.detail;
  } else if (errorData.message) {
    result.message = errorData.message;
  } else if (errorData.non_field_errors) {
    result.message = Array.isArray(errorData.non_field_errors)
      ? errorData.non_field_errors.join(", ")
      : errorData.non_field_errors;
  }

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      result.title = "Invalid Request";
      // Extract field-specific errors
      Object.keys(errorData).forEach((key) => {
        if (key !== "error" && key !== "detail" && key !== "message") {
          const fieldError = errorData[key];
          if (result.fieldErrors) {
            result.fieldErrors[key] = Array.isArray(fieldError)
              ? fieldError[0]
              : fieldError;
          }
        }
      });
      break;

    case 401:
      result.title = "Invalid Credentials";
      if (!errorData.error && !errorData.detail) {
        result.message = "The email or password you entered is incorrect.";
      }
      break;

    case 403:
      result.title = "Access Denied";
      // Handle role mismatch
      if (errorData.actual_role && errorData.detail) {
        result.message = errorData.detail;
      } else if (!errorData.error && !errorData.detail) {
        result.message = "You don't have permission to access this resource.";
      }
      break;

    case 404:
      result.title = "Not Found";
      result.message = errorData.detail || "The requested resource was not found.";
      break;

    case 409:
      result.title = "Conflict";
      result.message = errorData.detail || "A conflict occurred with the current state.";
      break;

    case 422:
      result.title = "Validation Error";
      result.message = errorData.detail || "Please check your input and try again.";
      break;

    case 429:
      result.title = "Too Many Requests";
      result.message = "You've made too many requests. Please try again later.";
      break;

    case 500:
      result.title = "Server Error";
      result.message = "An internal server error occurred. Please try again later.";
      break;

    case 503:
      result.title = "Service Unavailable";
      result.message = "The service is temporarily unavailable. Please try again later.";
      break;

    default:
      result.title = `Error ${status}`;
  }

  return result;
}

/**
 * Format error for display in toast notification
 */
export function formatErrorForToast(error: any) {
  const { title, message } = extractErrorMessage(error);
  return { title, description: message };
}

/**
 * Check if error is a specific type
 */
export function isAuthError(error: any): boolean {
  return error.response?.status === 401 || error.response?.status === 403;
}

export function isValidationError(error: any): boolean {
  return error.response?.status === 400 || error.response?.status === 422;
}

export function isNetworkError(error: any): boolean {
  return !error.response;
}

export function isServerError(error: any): boolean {
  const status = error.response?.status;
  return status >= 500 && status < 600;
}
