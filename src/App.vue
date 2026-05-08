<script setup lang="ts">
import { LayoutContent, Layout } from "@arco-design/web-vue";
import Header from "@/modules/header/Header.vue";
</script>

<template>
  <Layout class="!h-[calc(100%-60px)] !pt-60px">
    <Header></Header>
    <LayoutContent class="content">
      <router-view></router-view>
    </LayoutContent>
  </Layout>
</template>

<style lang="scss">
html,
body {
  height: 100%;
  --color-logo: rgb(85, 26, 139);
  --color-logo-1: rgb(237, 221, 249);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}

.content {
  background-color: var(--color-bg-5);
  height: calc(100% - 60px);
}

body[arco-theme="dark"] {
  --color-logo: var(--color-text-1);
  --color-logo-1: var(--color-bg-5);
}
</style>

