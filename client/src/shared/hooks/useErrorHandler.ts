export const useErrorHandler = () => {
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null) {
      const maybe = err as Record<string, unknown>;
      const response = maybe.response;
      if (typeof response === 'object' && response !== null) {
        const data = (response as Record<string, unknown>).data;
        if (typeof data === 'object' && data !== null) {
          const msg = (data as Record<string, unknown>).message;
          if (typeof msg === 'string') return msg;
        }
      }
    }
    return String(err);
  };

  return { getErrorMessage };
};

