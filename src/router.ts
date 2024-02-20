import { createRouter, createWebHistory } from "vue-router";

import Desktop from "@/components/desktop/Desktop.vue";

const routes = [
  { path: "/", component: Desktop },
];

const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: "text-gray-900 font-bold",
  routes,
});

export default router;
