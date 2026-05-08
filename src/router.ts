import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/views/home.vue";

const routes = [
  {
    name: Home.name,
    path: "/",
    component: () => import("./views/home.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export { router };
