import { createApp } from "vue";
import { createPinia } from "pinia";
import "virtual:uno.css";

import App from "@/App.vue";
import { router } from "@/router.js";

import "ant-design-vue/dist/reset.css";

createApp(App).use(router).use(createPinia()).mount("#app");
