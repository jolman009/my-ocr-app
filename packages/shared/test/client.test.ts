import { describe, it, expect, vi, beforeEach } from "vitest";
import { onUnauthorized, setAuthToken } from "../src/api/index.js";
import { getReceipt } from "../src/api/client.js";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthToken("fake-token");
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "123" })
    });
  });

  it("should trigger onUnauthorized interceptor when API returns 401", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" })
    });

    const mockInterceptor = vi.fn();
    const unsubscribe = onUnauthorized(mockInterceptor);

    try {
      await getReceipt("123");
    } catch (error) {
      // Expected to throw
    }

    expect(mockInterceptor).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("should append authorization header if token is present", async () => {
    await getReceipt("123");
    
    expect(fetchMock).toHaveBeenCalledOnce();
    const requestArgs = fetchMock.mock.calls[0];
    expect(requestArgs[1].headers.get("Authorization")).toBe("Bearer fake-token");
  });
});
