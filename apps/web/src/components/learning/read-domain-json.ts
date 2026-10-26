export async function readDomainJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Không thể tải dữ liệu học tập.");
  }
  return data;
}
