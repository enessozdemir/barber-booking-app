import { getErrorMessage } from '../../config/errorMessages';

export const useErrorHandler = () => {
  const handleError = (err: unknown): string => {
    // Try to extract error code from response
    if (typeof err === 'object' && err !== null) {
      const maybe = err as Record<string, unknown>;
      const response = maybe.response;
      if (typeof response === 'object' && response !== null) {
        const data = (response as Record<string, unknown>).data;
        if (typeof data === 'object' && data !== null) {
          const error = (data as Record<string, unknown>).error;
          if (typeof error === 'object' && error !== null) {
            const code = (error as Record<string, unknown>).code;
            if (typeof code === 'string') {
              return getErrorMessage(code);
            }
          }
        }
      }
    }

    // Fallback to generic error message
    return getErrorMessage();
  };

  return { handleError };
};
