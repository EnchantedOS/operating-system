
import * as Vue from 'vue';
import App from "./App.vue";
import VueTippy from "vue-tippy";
import "@/assets/tippy.css";
import "@/assets/fonts.scss";
import "tippy.js/animations/shift-away.css";
import router from "./router";
import { GesturePlugin } from "@vueuse/gesture";
import { MotionPlugin } from "@vueuse/motion";
import MasonryWall from '@yeger/vue-masonry-wall'

// utils
String.prototype.includesCI = function (val) {
  return this.toLowerCase().includes(val.toLowerCase());
}

const vue = Vue.createApp(App, {
  render: h => h(App)
});

document.body.addEventListener('touchmove', function(e){
  e.preventDefault();
});

async function load() {
  vue.use(MotionPlugin);
  vue.use(GesturePlugin);
  vue.use(router);
  vue.use(MasonryWall);
  vue.use(VueTippy, {
    directive: "tippy",
    component: "tippy",
    componentSingleton: "tippy-singleton",
    animation: "shift-away",
    defaultProps: {
      theme: "translucent",
      arrow: false,
      placement: "bottom",
      delay: [300, 50],
      duration: [50, 50],
      allowHTML: true,
    },
  });
  const app = vue.mount('#app');

  return {
    vue,
    app
  }
}

load().catch(error => console.error(error));
