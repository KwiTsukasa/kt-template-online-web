import { get, post } from "./request";

export interface ComponentListParams {
  pageSize: number;
  pageNo: number;
  type?: string;
  componentType?: string;
  name?: string;
}

export interface ComponentItem {
  id: string;
  createTime: string;
  componentTypeMsg: string;
  name: string;
  typeMsg: string;
  image: string;
}

export interface ComponentDetail {
  id: string;
  name: string;
  type: string | number;
  componentType: string | number;
  template: string;
}

export interface ComponentListResult {
  list: ComponentItem[];
  total: number;
}

export const getComponentList = (params: ComponentListParams) => {
  return get<ComponentListResult>("/component/list", { params });
};

export const getComponentDetail = (id: string) => {
  return get<ComponentDetail>("/component/detail", { params: { id } });
};

export const removeComponent = (id: string) => {
  return post<null>("/component/remove", undefined, { params: { id } });
};
