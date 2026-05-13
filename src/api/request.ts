import axios, { AxiosRequestConfig } from "axios";
import config from "@/config";

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

const request = axios.create({
  baseURL: config.axiosBase,
  timeout: 1000 * 30,
});

export const get = <T = any>(url: string, config?: AxiosRequestConfig) => {
  return request.get<any, ApiResponse<T>>(url, config);
};

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return request.post<any, ApiResponse<T>>(url, data, config);
};

request.interceptors.response.use((response) => response.data);

export default request;
