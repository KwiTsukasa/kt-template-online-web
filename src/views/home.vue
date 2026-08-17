<script lang="ts">
export default {
  name: "home",
};
</script>
<script setup lang="ts">
import ChartTypeGroup from "@/modules/chart-list/components/ChartTypeGroup.vue";
import Bus from "@/bus";
import ChartList from "@/modules/chart-list/ChartList.vue";
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
  <div class="home-page">
    <ChartTypeGroup @change="tabChange"></ChartTypeGroup>
    <div class="home-list">
      <ChartList />
    </div>
  </div>
</template>

<style lang="scss">
.content {
  padding: 16px 24px 20px;
}

.home-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.home-list {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .content {
    padding: 12px;
  }
}
</style>
