<script setup lang="ts">
import { RadioGroup, Radio } from "@arco-design/web-vue";
import axios from "axios";
import { onMounted, ref } from "vue";
import config from "@/config";

const emits = defineEmits(["change"]);

const handleChange = () => {
  emits("change", {
    type: type.value,
    componentType: componentType.value,
  });
};

const typeList = ref<any>([]);
const type = ref<string>("");

const componentTypeList = ref<any>([]);
const componentType = ref("");

const getComponentTypeList = async () => {
  const list = (await axios.get(`${config.axiosBase}/dict/getComponentDictByType?type=${type.value}`)).data.data;
  list.unshift({ label: "全部", value: "" });
  componentTypeList.value = list;
  componentType.value = componentTypeList.value[0]?.value;

  handleChange();
};

onMounted(async () => {
  typeList.value = (await axios.get(`${config.axiosBase}/dict/getDictByKey?dictKey=COMPONENT_TYPE`)).data.data;
  type.value = typeList.value[0]?.value;
  getComponentTypeList();
});
</script>
<template>
  <RadioGroup
    type="button"
    v-model="type"
    @change="getComponentTypeList"
    size="large"
    class="w-[fit-content] flex flex-wrap"
  >
    <Radio v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</Radio>
  </RadioGroup>

  <RadioGroup
    type="button"
    v-model="componentType"
    @change="handleChange"
    size="large"
    class="w-[fit-content] flex flex-wrap"
  >
    <Radio v-for="item in componentTypeList" :value="item.value" :key="item.value">
      {{ item.label }}
    </Radio>
  </RadioGroup>
</template>

