import axios, { AxiosRequestConfig } from "axios";
import config from "@/config";
import {
  clearAdminLoginRedirectMark,
  clearPersistedAuth,
  consumeAdminAuthRedirect,
  getStoredAccessToken,
  redirectToAdminLogin,
  refreshPersistedAuth,
  shouldSkipRepeatedAdminLoginRedirect,
} from "@/api/auth";

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  err?: unknown;
  message?: string;
  msg: string;
}

type AuthRetryConfig = AxiosRequestConfig & {
  _authRetried?: boolean;
};

type AuthHeaderMap = Record<string, unknown> & {
  get?: (name: string) => unknown;
};

const request = axios.create({
  baseURL: config.axiosBase,
  timeout: 1000 * 30,
  withCredentials: true,
});

export const get = <T = any>(url: string, config?: AxiosRequestConfig) => {
  return request.get<any, ApiResponse<T>>(url, config);
};

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return request.post<any, ApiResponse<T>>(url, data, config);
};

const getAuthErrorMessage = (data?: Partial<ApiResponse>) => {
  return data?.msg || data?.message || "登录已过期";
};

const getRequestAuthorization = (requestConfig?: AuthRetryConfig) => {
  const headers = requestConfig?.headers as AuthHeaderMap | undefined;

  if (!headers) return null;
  if (typeof headers.get === "function") {
    return headers.get("Authorization") || headers.get("authorization");
  }

  return headers.Authorization || headers.authorization;
};

const retryRequestWithFreshToken = async (requestConfig?: AuthRetryConfig) => {
  if (!requestConfig || requestConfig._authRetried) return null;

  const hasOldAccessToken = Boolean(
    getStoredAccessToken() || getRequestAuthorization(requestConfig),
  );
  if (!hasOldAccessToken) return null;

  requestConfig._authRetried = true;
  clearPersistedAuth();
  const accessToken = await refreshPersistedAuth();

  if (!accessToken) return null;

  requestConfig.headers = {
    ...(requestConfig.headers || {}),
    Authorization: `Bearer ${accessToken}`,
  };

  // 只有旧 accessToken 过期时才尝试刷新并重放一次，未登录 401 直接去 Admin。
  return request.request(requestConfig);
};

const redirectAfterAuthExpired = () => {
  clearPersistedAuth();
  if (shouldSkipRepeatedAdminLoginRedirect()) return;
  redirectToAdminLogin();
};

request.interceptors.request.use(async (requestConfig) => {
  const accessToken = consumeAdminAuthRedirect() || getStoredAccessToken();

  if (accessToken) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return requestConfig;
});

request.interceptors.response.use(
  async (response) => {
    if (response.data?.code === 401) {
      const retryResponse = await retryRequestWithFreshToken(response.config as AuthRetryConfig);
      if (retryResponse) return retryResponse;

      redirectAfterAuthExpired();
      return Promise.reject(new Error(getAuthErrorMessage(response.data)));
    }

    clearAdminLoginRedirectMark();
    return response.data;
  },
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const retryResponse = await retryRequestWithFreshToken(
        error.config as AuthRetryConfig | undefined,
      );
      if (retryResponse) return retryResponse;

      redirectAfterAuthExpired();
    }

    if (axios.isAxiosError<ApiResponse>(error)) {
      return Promise.reject(
        new Error(
          error.response?.data?.msg ||
            (typeof error.response?.data?.err === "string" ? error.response.data.err : "") ||
            error.response?.data?.message ||
            error.message ||
            "请求失败",
        ),
      );
    }

    return Promise.reject(error);
  },
);

export default request;
