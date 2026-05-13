<script setup lang="ts">
import { ConfigProvider, Layout, LayoutContent } from "ant-design-vue";
import { onMounted } from "vue";
import Header from "@/modules/header/Header.vue";
import { useTheme } from "@/hooks/useTheme";

const { initTheme, themeConfig } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <ConfigProvider :theme="themeConfig">
    <Layout class="app-layout">
      <Header></Header>
      <LayoutContent class="content">
        <router-view></router-view>
      </LayoutContent>
    </Layout>
  </ConfigProvider>
</template>

<style lang="scss">
html,
body {
  height: 100%;
  margin: 0;
  --color-logo: rgb(85, 26, 139);
  --color-logo-1: rgb(237, 221, 249);
  --app-bg: #f5f5f5;
  --app-surface: #ffffff;
  --app-border: #f0f0f0;
  --app-text: rgba(0, 0, 0, 0.88);
  --app-muted: rgba(0, 0, 0, 0.45);
  --app-cover-bg: linear-gradient(180deg, #fafafa 0%, #f5f7fb 100%);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--app-text);
  height: 100%;
}

.app-layout {
  height: 100vh;
  padding-top: 56px;
  background: var(--app-bg);
}

.content {
  background-color: var(--app-bg);
  height: calc(100vh - 56px);
  overflow: hidden;
}

body[data-theme="dark"] {
  --app-bg: #141414;
  --app-surface: #1f1f1f;
  --app-border: #303030;
  --app-text: rgba(255, 255, 255, 0.85);
  --app-muted: rgba(255, 255, 255, 0.45);
  --app-cover-bg: #262626;
  --color-logo: var(--app-text);
  --color-logo-1: var(--app-bg);
}
</style>
