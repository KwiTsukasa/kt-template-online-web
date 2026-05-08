import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import UnoCSS from "unocss/vite";

export default ({ mode }) => {
  const VITE_APP_PROXY: string = loadEnv(mode, process.cwd()).VITE_APP_PROXY;

  return defineConfig({
    plugins: [vue(), UnoCSS()],
    server: {
      proxy: {
        "/api": {
          target: VITE_APP_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  });
};

