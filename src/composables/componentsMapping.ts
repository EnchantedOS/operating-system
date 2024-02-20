import { defineAsyncComponent } from 'vue';

export const componentMappings = {
  userApp: {
    title: "Login",
    icon: "https://minotar.net/avatar/steve/64",
    single: true,
    closable: false,
    height: 450,
    width: 400,
    component: defineAsyncComponent(() =>
      import('../components/apps/LoginApp.vue')
    ),
  },
  /* Uncomment and update other app entries similarly
  builderApp: {
    title: "Builder",
    icon: "/boe.webp",
    height: 500,
    width: 800,
    single: false,
    closable: true,
    component: defineAsyncComponent(() =>
      import('./path/to/apps/BuilderApp.vue')
    ),
  },
  */
  endernetApp: {
    title: "Endernet",
    icon: "/items/ender_eye.png",
    single: false,
    height: 500,
    width: 600,
    closable: true,
    component: defineAsyncComponent(() =>
      import('../components/apps/EndernetApp.vue')
    ),
  },
  serverApp: {
    title: "Server",
    icon: "/items/repeater.png",
    single: false,
    height: 500,
    width: 700,
    closable: true,
    component: defineAsyncComponent(() =>
      import('../components/apps/ServerApp.vue')
    ),
  },
};
