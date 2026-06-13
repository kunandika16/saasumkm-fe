import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  isAuthenticated,
} from "@/lib/auth";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constants";

describe("Auth Token Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("storeTokens", () => {
    it("should store access and refresh tokens in localStorage", () => {
      storeTokens("access-123", "refresh-456");
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("access-123");
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-456");
    });
  });

  describe("getAccessToken", () => {
    it("should return null when no token is stored", () => {
      expect(getAccessToken()).toBeNull();
    });

    it("should return the stored access token", () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "my-token");
      expect(getAccessToken()).toBe("my-token");
    });
  });

  describe("getRefreshToken", () => {
    it("should return null when no token is stored", () => {
      expect(getRefreshToken()).toBeNull();
    });

    it("should return the stored refresh token", () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, "my-refresh");
      expect(getRefreshToken()).toBe("my-refresh");
    });
  });

  describe("clearTokens", () => {
    it("should remove both tokens from localStorage", () => {
      storeTokens("access", "refresh");
      clearTokens();
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return false when no access token is stored", () => {
      expect(isAuthenticated()).toBe(false);
    });

    it("should return true when access token is stored", () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "some-token");
      expect(isAuthenticated()).toBe(true);
    });
  });
});

describe("API Client Interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should attach Authorization header when token exists", async () => {
    // Store a token
    storeTokens("test-access-token", "test-refresh-token");

    // Import the apiClient (which has interceptors)
    const { default: apiClient } = await import("@/lib/api-client");

    // Create a mock adapter to intercept the request
    const requestInterceptor = apiClient.interceptors.request as any;

    // Verify that the request interceptor is registered
    expect(requestInterceptor.handlers.length).toBeGreaterThan(0);

    // Simulate a request config passing through the interceptor
    const config = {
      headers: {
        set: vi.fn(),
        get: vi.fn(),
        has: vi.fn(),
        delete: vi.fn(),
      } as any,
      url: "/api/test",
    };

    // The first handler's fulfilled function
    const fulfilledHandler = requestInterceptor.handlers[0].fulfilled;
    const result = await fulfilledHandler(config);

    expect(result.headers.Authorization).toBe("Bearer test-access-token");
  });

  it("should not attach Authorization header when no token exists", async () => {
    // Ensure no token
    localStorage.clear();

    const { default: apiClient } = await import("@/lib/api-client");

    const requestInterceptor = apiClient.interceptors.request as any;
    const fulfilledHandler = requestInterceptor.handlers[0].fulfilled;

    const config = {
      headers: {} as any,
      url: "/api/test",
    };

    const result = await fulfilledHandler(config);
    expect(result.headers.Authorization).toBeUndefined();
  });
});
