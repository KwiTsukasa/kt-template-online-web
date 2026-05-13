<script setup lang="ts">
import { useRoute } from "vue-router";
import { InputSearch } from "ant-design-vue";
import { computed, reactive, onBeforeUnmount, onMounted } from "vue";
import Theme from "@/modules/theme/Theme.vue";

import Bus from "@/bus";
import Logo from "@/components/logo/Logo.vue";

import { isSearchEnabled } from "./queries";

// 搜索输入框
const pageData = reactive({
  loaded: false,
});
const searchData = reactive({
  loading: false,
  content: "",
});
const route = useRoute();
const showSearch = computed<boolean>(() => isSearchEnabled(pageData.loaded, route.name));
const searchClick = () => {
  Bus.$emit("home-search", searchData.content);
};

onMounted(() => {
  pageData.loaded = true;
  // 接收搜索 loading 变化事件
  Bus.$on("search-loading", (loading: boolean) => {
    searchData.loading = loading;
  });
});
onBeforeUnmount(() => {
  Bus.$off("home-search");
  Bus.$off("search-loading");
});
</script>
<template>
  <div class="nav-bar_wrapper">
    <div class="nav-bar_content">
      <div class="nav-bar_left">
        <Logo></Logo>
      </div>
      <div class="nav-bar_right">
        <div class="menu">
          <InputSearch
            class="search-input"
            v-model:value="searchData.content"
            v-if="showSearch"
            placeholder="输入关键词"
            enter-button="搜索"
            @search="searchClick"
            :loading="searchData.loading"
            allow-clear
          />
        </div>
        <Theme class="theme"></Theme>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav-bar_wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  border-bottom: 1px solid var(--app-border);
  background-color: var(--app-surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.nav-bar_content {
  position: relative;
  display: flex;
  width: 100%;
  height: 56px;
  min-height: 56px;
  max-height: 56px;
  box-sizing: border-box;
  z-index: 999;
  padding: 0 24px;
}

.nav-bar_left {
  width: 190px;
  font-size: 26px;
  line-height: 1;
}

.nav-bar_right {
  height: 100%;
  display: flex;
  flex: 1;
  align-items: center;
  gap: 16px;

  .menu {
    flex: 1;
    .search-input {
      width: 360px;
      max-width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .nav-bar_content {
    padding: 0 12px;
  }

  .nav-bar_left {
    width: 150px;
    font-size: 22px;
  }
}
</style>
