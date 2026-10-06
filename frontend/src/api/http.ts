/** 业务冲突（4xx）不重试，直接抛出由页面提示；网络/5xx 失败按同一 operation_id 重试 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public body: unknown
  ) {
    super(message);
  }
}

export const newOperationId = () =>
  `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * 写操作请求封装：携带幂等操作编号。
 * 写入失败（网络错误或 5xx）时用同一个 operation_id 重试，
 * 服务端按编号去重，不会产生重复记录。
 */
export async function postWithOperationRetry<T>(url: string, payload: unknown, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = (body as { code?: string }).code ?? "INTERNAL_ERROR";
        const message = (body as { message?: string }).message ?? res.statusText;
        if (res.status >= 500 && attempt < retries) {
          lastError = new ApiError(res.status, code, message, body);
          continue; // 同一 operation_id 重试
        }
        throw new ApiError(res.status, code, message, body);
      }
      return body as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      lastError = err; // 网络层失败：同一 operation_id 重试
    }
  }
  throw lastError;
}
