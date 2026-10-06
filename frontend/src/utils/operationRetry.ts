// 写入失败后按操作编号重试：同一操作编号重放，服务端幂等
export async function withOperationRetry<T>(
  fn: (operationNo: string) => Promise<T>,
  operationNo: string,
  retries = 3
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(operationNo);
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      // 4xx（含 409 版本冲突）不重试，直接抛出由 UI 提示同步
      if (status != null && status < 500) throw err;
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }
  throw lastError;
}

export function createOperationNo(): string {
  return `op-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
