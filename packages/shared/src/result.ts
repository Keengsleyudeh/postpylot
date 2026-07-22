// A typed result for platform services and other operations that can partially
// succeed. Platform services return `unsupported` instead of throwing when an
// action is not available for a platform (per postpylot-architecture.mdc).
export type ServiceResult<T = void> =
  | { status: "ok"; data: T }
  | { status: "unsupported"; reason: string }
  | { status: "error"; error: string; retryable?: boolean };

export function ok<T>(data: T): ServiceResult<T> {
  return { status: "ok", data };
}

export function unsupported<T = never>(reason: string): ServiceResult<T> {
  return { status: "unsupported", reason };
}

export function fail<T = never>(
  error: string,
  retryable = false
): ServiceResult<T> {
  return { status: "error", error, retryable };
}

export function isOk<T>(
  result: ServiceResult<T>
): result is { status: "ok"; data: T } {
  return result.status === "ok";
}
