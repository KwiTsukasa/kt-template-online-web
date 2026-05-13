<script setup lang="ts">
import { RadioButton, RadioGroup } from "ant-design-vue";
import { onMounted, ref } from "vue";
import { getComponentDictByType, getDictByKey, DictItem } from "@/api/dict";

const emits = defineEmits(["change"]);

const handleChange = () => {
  emits("change", {
    type: type.value,
    componentType: componentType.value,
  });
};

const typeList = ref<DictItem[]>([]);
const type = ref<string>("");

const componentTypeList = ref<DictItem[]>([]);
const componentType = ref("");

const getComponentTypeList = async () => {
  const list = (await getComponentDictByType(type.value)).data;
  componentTypeList.value = [{ label: "全部", value: "" }, ...list];
  componentType.value = componentTypeList.value[0]?.value;

  handleChange();
};

onMounted(async () => {
  typeList.value = (await getDictByKey("COMPONENT_TYPE")).data;
  type.value = typeList.value[0]?.value;
  getComponentTypeList();
});
</script>
<template>
  <div class="filter-panel">
    <RadioGroup
      v-model:value="type"
      @change="getComponentTypeList"
      size="default"
      option-type="button"
      button-style="solid"
      class="filter-row"
    >
      <RadioButton v-for="item in typeList" :value="item.value" :key="item.value">{{ item.label }}</RadioButton>
    </RadioGroup>

    <RadioGroup
      v-model:value="componentType"
      @change="handleChange"
      size="default"
      option-type="button"
      button-style="solid"
      class="filter-row"
    >
      <RadioButton v-for="item in componentTypeList" :value="item.value" :key="item.value">
        {{ item.label }}
      </RadioButton>
    </RadioGroup>
  </div>
</template>

<style lang="scss" scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.ant-radio-button-wrapper) {
  height: 30px;
  line-height: 28px;
  border-inline-start-width: 1px;
  border-radius: 6px;
}

:deep(.ant-radio-button-wrapper::before) {
  display: none;
}
</style>
