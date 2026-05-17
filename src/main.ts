import { createApp } from "vue";
import { createPinia } from "pinia";
import "virtual:uno.css";

import App from "@/App.vue";
import { consumeAdminAuthRedirect } from "@/api/auth";
import { router } from "@/router.js";

import "ant-design-vue/dist/reset.css";

consumeAdminAuthRedirect();

createApp(App).use(router).use(createPinia()).mount("#app");
