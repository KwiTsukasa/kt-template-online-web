import { get } from "./request";

export interface DictItem {
  label: string;
  value: string;
}

export const getComponentDictByType = (type: string) => {
  return get<DictItem[]>("/dict/getComponentDictByType", { params: { type } });
};

export const getDictByKey = (dictKey: string) => {
  return get<DictItem[]>("/dict/getDictByKey", { params: { dictKey } });
};
