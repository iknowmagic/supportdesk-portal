export const extractInvokeError = async (
  error: unknown,
  response: Response | undefined,
  fallback: string,
) => {
  if (response) {
    try {
      const parsed = await response.json();
      if (parsed?.error) return parsed.error as string;
    } catch {
      // ignore parse errors
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
