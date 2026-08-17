import { computed, ref } from "vue";
import { theme as antTheme } from "ant-design-vue";

type ThemeType = "light" | "dark";

const theme = ref<ThemeType>("light");

const applyDocumentTheme = (value: ThemeType) => {
  if (value === "dark") {
    document.body.setAttribute("data-theme", "dark");
  } else {
    document.body.removeAttribute("data-theme");
  }
};

export const themeConfig = computed(() => ({
  algorithm: (() => {
    if (theme.value === "dark") {
      return antTheme.darkAlgorithm;
    }
    return antTheme.defaultAlgorithm;
  })(),
}));

export const setTheme = (value: ThemeType) => {
  theme.value = value;
  localStorage.setItem("theme", value);
  applyDocumentTheme(value);
};

export const initTheme = () => {
  const themeValue = (localStorage.getItem("theme") as ThemeType | null) || "light";
  setTheme(themeValue);
};

export const useTheme = () => ({
  theme,
  themeConfig,
  setTheme,
  initTheme,
});
