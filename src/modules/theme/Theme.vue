<script setup lang="ts">
import { BulbFilled, BulbOutlined } from "@ant-design/icons-vue";
import { useTheme } from "@/hooks/useTheme";

const { theme, setTheme } = useTheme();
</script>
<template>
  <BulbFilled v-if="theme === 'dark'" class="moon theme-icon" @click="() => setTheme('light')" />
  <BulbOutlined v-else class="sun theme-icon" @click="() => setTheme('dark')" />
</template>


<style lang="scss" scoped>
.moon {
  color: var(--app-text);
}

.theme-icon {
  cursor: pointer;
  font-size: 24px;
}
</style>
