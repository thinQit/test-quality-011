type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const status = response.status;
    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : undefined;

    if (!response.ok) {
      return {
        status,
        error: (data as { error?: string } | undefined)?.error ?? 'Request failed.'
      };
    }

    return { status, data };
  } catch (error) {
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Network error.'
    };
  }
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) => request<T>(url, { method: 'POST', body }),
  put: <T>(url: string, body?: unknown) => request<T>(url, { method: 'PUT', body }),
  patch: <T>(url: string, body?: unknown) => request<T>(url, { method: 'PATCH', body }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' })
};

export default api;
export type { ApiResponse };
