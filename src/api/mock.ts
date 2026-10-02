/** Returns true when mock/local data should be used instead of the API. */
export function isMockDataEnabled(): boolean {
  return import.meta.env.VITE_USE_MOCK_DATA !== "false";
}

/** Simulates network delay for mock responses (optional realism). */
export function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
