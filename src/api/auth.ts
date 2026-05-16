import axios from "axios";
import config from "@/config";

type VbenResponse<T = any> = {
  code: number;
  data: T;
  message?: string;
};

type PersistedAuth = {
  accessCodes?: string[];
  accessToken: string;
  userInfo?: unknown;
};

const ACCESS_TOKEN_KEY = "kt-admin-access-token";
const ACCESS_CODES_KEY = "kt-admin-access-codes";
const USER_INFO_KEY = "kt-admin-user-info";

let refreshPromise: Promise<string | null> | null = null;

const authClient = axios.create({
  baseURL: config.axiosBase,
  timeout: 1000 * 30,
  withCredentials: true,
});

export const getStoredAccessToken = () => {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const clearPersistedAuth = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_CODES_KEY);
  window.localStorage.removeItem(USER_INFO_KEY);
};

export const persistAuthData = ({
  accessCodes,
  accessToken,
  userInfo,
}: PersistedAuth) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (accessCodes) {
    window.localStorage.setItem(ACCESS_CODES_KEY, JSON.stringify(accessCodes));
  }
  if (userInfo) {
    window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  }
};

export const redirectToAdminLogin = () => {
  const loginUrl = new URL(config.adminLogin);
  loginUrl.searchParams.set("redirect", encodeURIComponent(window.location.href));
  window.location.href = loginUrl.toString();
};

export const refreshPersistedAuth = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshResponse = await authClient.post<string>("/auth/refresh", {});
      const accessToken = refreshResponse.data;

      if (!accessToken) {
        clearPersistedAuth();
        return null;
      }

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const [userInfoResult, accessCodesResult] = await Promise.allSettled([
        authClient.get<VbenResponse>("/user/info", { headers }),
        authClient.get<VbenResponse<string[]>>("/auth/codes", { headers }),
      ]);

      persistAuthData({
        accessCodes:
          accessCodesResult.status === "fulfilled"
            ? accessCodesResult.value.data.data
            : undefined,
        accessToken,
        userInfo:
          userInfoResult.status === "fulfilled"
            ? userInfoResult.value.data.data
            : undefined,
      });

      return accessToken;
    } catch {
      clearPersistedAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
