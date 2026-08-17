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
const LOGIN_REDIRECT_MARK_KEY = "kt-admin-login-redirect-at";
const LOGIN_REDIRECT_COOLDOWN = 10 * 1000;
const AUTH_TRANSFER_TOKEN_KEY = "ktAccessToken";
const AUTH_TRANSFER_CODES_KEY = "ktAccessCodes";
const AUTH_TRANSFER_USER_KEY = "ktUserInfo";

let refreshPromise: Promise<string | null> | null = null;
let redirectingToAdminLogin = false;

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

export const clearAdminLoginRedirectMark = () => {
  window.sessionStorage.removeItem(LOGIN_REDIRECT_MARK_KEY);
};

export const shouldSkipRepeatedAdminLoginRedirect = () => {
  const redirectAt = Number(window.sessionStorage.getItem(LOGIN_REDIRECT_MARK_KEY));

  return Number.isFinite(redirectAt) && Date.now() - redirectAt < LOGIN_REDIRECT_COOLDOWN;
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

const parseAuthTransferJson = <T>(value: string | null) => {
  if (!value) return undefined;

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const removeAuthTransferParams = (url: URL) => {
  url.searchParams.delete(AUTH_TRANSFER_TOKEN_KEY);
  url.searchParams.delete(AUTH_TRANSFER_CODES_KEY);
  url.searchParams.delete(AUTH_TRANSFER_USER_KEY);
  window.history.replaceState(
    window.history.state,
    document.title,
    `${url.pathname}${url.search}${url.hash}`,
  );
};

export const consumeAdminAuthRedirect = () => {
  const url = new URL(window.location.href);
  const accessToken = url.searchParams.get(AUTH_TRANSFER_TOKEN_KEY);

  if (!accessToken) return null;

  persistAuthData({
    accessCodes: parseAuthTransferJson<string[]>(
      url.searchParams.get(AUTH_TRANSFER_CODES_KEY),
    ),
    accessToken,
    userInfo: parseAuthTransferJson<unknown>(
      url.searchParams.get(AUTH_TRANSFER_USER_KEY),
    ),
  });
  clearAdminLoginRedirectMark();
  removeAuthTransferParams(url);

  return accessToken;
};

const buildAdminLoginUrl = (redirect: string) => {
  const loginUrl = new URL(config.adminLogin);

  if (loginUrl.hash) {
    const [hashPath, hashSearch = ""] = loginUrl.hash.slice(1).split("?");
    const hashParams = new URLSearchParams(hashSearch);
    hashParams.set("redirect", redirect);
    // Admin 生产环境使用 hash 路由，redirect 必须放在 hash 内部才能被 Vue Router 读取。
    loginUrl.hash = `${hashPath}?${hashParams.toString()}`;
    return loginUrl.toString();
  }

  loginUrl.searchParams.set("redirect", redirect);
  return loginUrl.toString();
};

export const redirectToAdminLogin = () => {
  if (redirectingToAdminLogin) return;

  redirectingToAdminLogin = true;
  window.sessionStorage.setItem(LOGIN_REDIRECT_MARK_KEY, String(Date.now()));
  window.location.href = buildAdminLoginUrl(window.location.href);
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
          (() => {
            if (accessCodesResult.status === "fulfilled") {
              return accessCodesResult.value.data.data;
            }
            return undefined;
          })(),
        accessToken,
        userInfo:
          (() => {
            if (userInfoResult.status === "fulfilled") {
              return userInfoResult.value.data.data;
            }
            return undefined;
          })(),
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
