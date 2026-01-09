type CaptureHandler = (entry: RawNetworkCall) => void;
type FetchFn = typeof globalThis.fetch;

export interface RawNetworkCall {
  id?: string;
  url: string;
  method: string;
  status?: number;
  ok?: boolean;
  durationMs?: number;
  payload?: string | null;
  response?: string | null;
  responseContentType?: string | null;
  error?: string | null;
  timestamp: string;
}

let originalFetch: FetchFn | null = null;
let captureHandler: CaptureHandler | null = null;
let isPatched = false;

const serializeBody = (body: BodyInit | null | undefined): string | null => {
  if (body == null) return null;
  if (typeof body === 'string') return body;
  if (body instanceof URLSearchParams) {
    return body.toString();
  }
  if (body instanceof FormData) {
    const entries: Record<string, unknown[]> = {};
    body.forEach((value, key) => {
      if (!entries[key]) entries[key] = [];
      entries[key].push(value instanceof File ? `[File:${value.name}]` : value);
    });
    try {
      return JSON.stringify(entries);
    } catch {
      return '[FormData]';
    }
  }
  if (body instanceof Blob) {
    return `[Blob size=${body.size}]`;
  }
  if (body instanceof ArrayBuffer) {
    return `[ArrayBuffer bytes=${body.byteLength}]`;
  }
  if (body instanceof ReadableStream) {
    return '[ReadableStream]';
  }
  try {
    return JSON.stringify(body);
  } catch {
    return String(body);
  }
};

const readResponseBody = async (response: Response): Promise<string | null> => {
  try {
    const clone = response.clone();
    return await clone.text();
  } catch {
    return null;
  }
};

export const initNetworkCapture = () => {
  if (isPatched) return;
  if (typeof globalThis.fetch !== 'function') return;

  originalFetch = globalThis.fetch;
  const patchedFetch: FetchFn = async (input, init) => {
    const start = typeof performance !== 'undefined' ? performance.now() : 0;
    const timestamp = new Date().toISOString();
    const method =
      init?.method ?? (typeof input === 'string' ? 'GET' : input instanceof Request ? input.method : 'GET');
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input instanceof Request
            ? input.url
            : String(input);
    const payload =
      init?.body != null ? serializeBody(init.body) : input instanceof Request && input.method !== 'GET' ? null : null;

    try {
      const response = await (originalFetch as FetchFn)(input as RequestInfo, init as RequestInit);
      if (captureHandler) {
        const responseBody = await readResponseBody(response);
        captureHandler({
          url,
          method,
          status: response.status,
          ok: response.ok,
          durationMs: typeof performance !== 'undefined' ? performance.now() - start : undefined,
          payload,
          response: responseBody,
          responseContentType: response.headers.get('content-type'),
          error: null,
          timestamp,
        });
      }
      return response;
    } catch (error) {
      if (captureHandler) {
        captureHandler({
          url,
          method,
          status: undefined,
          ok: false,
          durationMs: typeof performance !== 'undefined' ? performance.now() - start : undefined,
          payload,
          response: null,
          responseContentType: null,
          error: error instanceof Error ? error.message : String(error),
          timestamp,
        });
      }
      throw error;
    }
  };

  (patchedFetch as unknown as { __patched?: true }).__patched = true;
  globalThis.fetch = patchedFetch;
  isPatched = true;
};

export const setNetworkCaptureHandler = (handler: CaptureHandler | null) => {
  captureHandler = handler;
};
