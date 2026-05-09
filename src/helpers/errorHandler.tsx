import toast from "react-hot-toast";

/**
 * Type for handling errors with unknown structure.
 * Allows accessing arbitrary properties on error objects.
 */
type UnknownError = Record<string, unknown>;

/**
 * Default message shown when a network-related error is detected.
 * Informs users to check their internet connection.
 */
const NETWORK_ERROR_MESSAGE =
  "Network error detected. Check your internet connection and try again.";

/**
 * Fallback message when no specific error information is available.
 * Generic and non-alarming to avoid confusing users.
 */
const GENERIC_ERROR_MESSAGE = "An error occurred. Please try again.";

/**
 * Regex patterns used to identify network-related errors.
 * Matches common fetch, connection, and timeout error messages.
 * Case-insensitive for robustness across different error sources.
 */
const NETWORK_ERROR_PATTERNS = [
  /Failed to fetch/i, // Standard fetch API errors
  /Network Error/i, // Browser network errors
  /ECONNABORTED/i, // Node.js connection abort errors
  /timeout/i, // Request timeout errors
];

/**
 * Extracts a human-readable error message from various error sources.
 *
 * This function handles multiple error formats commonly encountered in modern web apps:
 * - Plain strings: Returns the string directly
 * - Error objects: Extracts the message property
 * - Objects with nested error data: Searches for common message properties
 * - API responses: Recursively digs into nested objects and response structures
 * - Arrays: Joins multiple error messages with " | " separator
 *
 * @param {unknown} error - The error object/string to extract message from. Can be any type.
 * @returns {string | undefined} The extracted error message, or undefined if no message found.
 *
 * @example
 * extractErrorMessage("Connection failed"); // "Connection failed"
 * extractErrorMessage(new Error("Validation error")); // "Validation error"
 * extractErrorMessage({ message: "API failed" }); // "API failed"
 * extractErrorMessage({ data: { detail: "Not found" } }); // "Not found"
 */
function extractErrorMessage(error: unknown): string | undefined {
  // Handle plain strings: trim and return if not empty
  if (typeof error === "string") {
    return error.trim() || undefined;
  }

  // Handle native Error objects: extract and trim the message property
  if (error instanceof Error) {
    return error.message.trim() || undefined;
  }

  // Handle complex objects: search for error information in various property names
  if (error && typeof error === "object") {
    const anyError = error as UnknownError;

    // List of common property names where error messages might be stored.
    // Order matters: checks most common properties first.
    const candidateKeys = [
      "message",
      "error",
      "description",
      "detail",
      "hint",
      "msg",
      "statusText",
      "title",
    ];

    // Check each candidate property for a usable error message
    for (const key of candidateKeys) {
      const value = anyError[key];

      // If property is a non-empty string, return it
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }

      // If property is an array, try to extract string values and join them
      if (Array.isArray(value)) {
        const stringValues = value
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
        if (stringValues.length > 0) {
          return stringValues.join(" | ");
        }
      }

      // If property is an object, recursively search it for error messages
      if (value && typeof value === "object") {
        const nestedMessage = extractErrorMessage(value);
        if (nestedMessage) {
          return nestedMessage;
        }
      }
    }

    // Check for data property (common in API responses)
    if ("data" in anyError) {
      const nestedMessage = extractErrorMessage(anyError.data);
      if (nestedMessage) {
        return nestedMessage;
      }
    }

    // Check for response property (common in fetch/axios responses)
    if ("response" in anyError) {
      const nestedMessage = extractErrorMessage(anyError.response);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  // No error message found in any format
  return undefined;
}

/**
 * Determines if an error message indicates a network/connectivity issue.
 *
 * Uses regex patterns to match common network error messages from various sources
 * (fetch API, browser errors, Node.js errors, etc.).
 * Case-insensitive matching for reliability across different error sources.
 *
 * @param {string} message - The error message to check
 * @returns {boolean} True if the message indicates a network error, false otherwise
 *
 * @example
 * isNetworkError("Failed to fetch"); // true
 * isNetworkError("timeout of 5000ms exceeded"); // true
 * isNetworkError("Validation error"); // false
 */
function isNetworkError(message: string): boolean {
  return NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Resolves an error message by trying multiple sources in order of priority.
 *
 * Resolution order:
 * 1. Extracted message from the error object (handles all error types)
 * 2. Provided default message (fallback for when error extraction fails)
 * 3. undefined (no message available - caller should decide how to handle this)
 *
 * This function does NOT return a generic fallback message; the caller is responsible
 * for deciding what to do if no message is found.
 *
 * @param {unknown} error - The error object to extract message from (any format)
 * @param {string} [defaultMessage] - Optional fallback message if extraction fails
 * @returns {string | undefined} The resolved error message, or undefined if none available
 *
 * @example
 * resolveMessage(new Error("Failed"), "Try again"); // "Failed"
 * resolveMessage(undefined, "Try again"); // "Try again"
 * resolveMessage(undefined, undefined); // undefined
 */
function resolveMessage(
  error?: unknown,
  defaultMessage?: string,
): string | undefined {
  // Try to extract a message from the error object first
  const message = extractErrorMessage(error);
  if (message) {
    return message;
  }

  // Fall back to the provided default message if it's not empty
  if (defaultMessage && defaultMessage.trim()) {
    return defaultMessage.trim();
  }

  // No message available from any source
  return undefined;
}

/**
 * Throws an Error with an appropriate message extracted from the error object.
 *
 * Accepts the full error object (from Supabase, fetch, axios, etc.) and intelligently
 * extracts a message from it using multiple fallback strategies.
 *
 * Behavior:
 * - Extracts/resolves an error message from the input error object or string
 * - If no message is available, silently returns (no-op)
 * - If message indicates a network error, throws the standard NETWORK_ERROR_MESSAGE
 * - Otherwise, throws the resolved error message
 *
 * This is useful in async functions where you want to throw errors to be caught
 * by try-catch blocks or error boundaries.
 *
 * @param {unknown} error - The full error object/message from an API call or operation (e.g., Supabase error, fetch error)
 * @param {string} [defaultMessage] - Optional custom message if error extraction fails
 * @throws {Error} Throws an Error with the resolved message (or network message if applicable)
 * @returns {void}
 *
 * @example
 * // In an async function with Supabase error:
 * const { error } = await supabase.auth.signUp({ ... });
 * errorThrowHandler(error, "Sign up failed. Please try again.");
 *
 * // With API response error object:
 * try {
 *   await api.post('/endpoint', data);
 * } catch (error) {
 *   errorThrowHandler(error, "Operation failed.");
 * }
 *
 * // Silent no-op when no error:
 * errorThrowHandler(null, undefined); // Returns silently, no error thrown
 */
export function errorThrowHandler(error?: unknown, defaultMessage?: string) {
  const message = resolveMessage(error, defaultMessage);

  // If no message was resolved, silently return (no-op)
  if (!message) {
    return;
  }

  // Check if this is a network-related error and use standardized message
  if (isNetworkError(message)) {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  // Throw the actual error message
  throw new Error(message);
}

/**
 * Displays an error message as a toast notification to the user.
 *
 * Accepts the full error object (from Supabase, fetch, axios, etc.) and intelligently
 * extracts a message from it using multiple fallback strategies.
 *
 * Behavior:
 * - Extracts/resolves an error message from the input error object or string
 * - If no message is available, silently returns (no-op, no toast shown)
 * - If message indicates a network error, shows the standard NETWORK_ERROR_MESSAGE
 * - Otherwise, shows the resolved error message as a toast
 *
 * This is the preferred way to show errors to users in the UI without interrupting flow.
 * Uses react-hot-toast to display non-blocking error notifications.
 *
 * @param {unknown} error - The full error object/message from an API call or operation (e.g., Supabase error, fetch error)
 * @param {string} [defaultMessage] - Optional custom message if error extraction fails
 * @returns {void}
 *
 * @example
 * // Basic usage with Supabase error:
 * const { error } = await supabase.auth.updateUser({ password });
 * errorToastHandler(error, "Failed to update password. Please try again.");
 *
 * // With fetch API error:
 * try {
 *   const response = await fetch('/api/data');
 *   const data = await response.json();
 * } catch (error) {
 *   errorToastHandler(error, "Failed to load data.");
 * }
 *
 * // Silent no-op when no error (no toast shown):
 * errorToastHandler(null, undefined); // Returns silently
 *
 * @see {@link https://react-hot-toast.com} for toast API documentation
 */
export function errorToastHandler(error?: unknown, defaultMessage?: string) {
  // Resolve the error message from any source
  const message = resolveMessage(error, defaultMessage);

  // If no message was resolved, silently return without showing a toast
  if (!message) {
    return;
  }

  // Determine which message to show: network message or the actual error message
  const toastMessage = isNetworkError(message)
    ? NETWORK_ERROR_MESSAGE
    : message;

  // Display the error as a toast notification to the user
  toast.error(toastMessage);
}
