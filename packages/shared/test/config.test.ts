import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getApiBaseUrl,
  setApiBaseUrl,
  getAuthToken,
  setAuthToken,
  getRequestTimeoutMs,
  setRequestTimeoutMs,
  getApiOrigin
} from "../src/api/config.js";

describe("API Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should have default values", () => {
    expect(getApiBaseUrl()).toBe("http://localhost:4000/api");
    expect(getApiOrigin()).toBe("http://localhost:4000");
    expect(getAuthToken()).toBeNull();
    expect(getRequestTimeoutMs()).toBe(15_000);
  });

  it("should safely append trailing slashes when setting baseUrl", () => {
    setApiBaseUrl("https://api.example.com/api/");
    expect(getApiBaseUrl()).toBe("https://api.example.com/api");
    expect(getApiOrigin()).toBe("https://api.example.com");
  });

  it("should persist auth token config globally", () => {
    setAuthToken("fake-jwt-token");
    expect(getAuthToken()).toBe("fake-jwt-token");
  });

  it("should persist request timeout values", () => {
    setRequestTimeoutMs(30_000);
    expect(getRequestTimeoutMs()).toBe(30_000);
  });
});
