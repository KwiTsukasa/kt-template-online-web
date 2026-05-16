import axios, { AxiosRequestConfig } from "axios";
import config from "@/config";
import {
  clearPersistedAuth,
  getStoredAccessToken,
  redirectToAdminLogin,
  refreshPersistedAuth,
} from "@/api/auth";

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

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

request.interceptors.request.use(async (requestConfig) => {
  let accessToken = getStoredAccessToken();

  if (!accessToken) {
    accessToken = await refreshPersistedAuth();
  }

  if (accessToken) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return requestConfig;
});

request.interceptors.response.use(
  (response) => {
    if (response.data?.code === 401) {
      clearPersistedAuth();
      redirectToAdminLogin();
      return Promise.reject(new Error(response.data?.msg || "登录已过期"));
    }

    return response.data;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearPersistedAuth();
      redirectToAdminLogin();
    }

    return Promise.reject(error);
  },
);

export default request;
