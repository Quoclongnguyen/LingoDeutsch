const defaultErrorMessage = "Không thể tải dữ liệu học tập.";

export async function readDomainJson<T>(
  response: Response,
  fallbackMessage = defaultErrorMessage,
): Promise<T> {
  const body = await response.text();
  let data: unknown;
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      data = undefined;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : fallbackMessage;
    throw new Error(message);
  }
  if (data === undefined) {
    throw new Error("Phản hồi từ dịch vụ học tập không hợp lệ.");
  }
  return data as T;
}
