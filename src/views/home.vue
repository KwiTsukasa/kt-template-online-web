<script lang="ts">
export default {
  name: "home",
};
</script>
<script setup lang="ts">
import ChartTypeGroup from "@/modules/chartList/components/ChartTypeGroup.vue";
import Bus from "@/bus";
import ChartList from "@/modules/chartList/ChartList.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { unref } from "vue";

const tabData = ref<Tab>();

type Tab = {
  componentType: string;
  type: string;
};

const searchValue = ref("");

const tabChange = (params: Tab) => {
  tabData.value = params;
  Bus.$emit("search", { ...tabData.value, searchValue: unref(searchValue) });
};

onMounted(() => {
  Bus.$on("home-search", (params) => {
    searchValue.value = params;
    Bus.$emit("search", { ...tabData.value, searchValue: unref(searchValue) });
  });
});

onBeforeUnmount(() => {
  Bus.$off("search-loading");
});
</script>

<template>
  <div class="h-full w-full flex flex-col overflow-hidden gap-8px">
    <ChartTypeGroup @change="tabChange"></ChartTypeGroup>
    <div class="flex-1 overflow-hidden">
      <ChartList />
    </div>
  </div>
</template>

<style lang="scss">
.content {
  padding: 20px 30px;
}
</style>

