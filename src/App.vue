<script lang="ts" setup>
import { onMounted, ref } from "vue";
import Desktop from "@/components/desktop/Desktop.vue";
import { Input } from "@/components/ui/input";
import "./assets/index.css";
import { initProvider, isSynced, url } from '@/store.ts'

// import { check } from "@tauri-apps/plugin-updater";
// import { relaunch } from "@tauri-apps/plugin-process";

const mounted = ref(false);

onMounted(async () => {
  setTimeout(() => {
    mounted.value = true;
  }, 500);

  // const update = await check();
  // if (update?.response?.available) {
  //   await update.downloadAndInstall();
  //   await relaunch();
  // } else {
  //   console.log("No update available");
  // }
});
</script>

<template>
  <div id="app">
    <transition name="fade">
      <div
        style="z-index: 111111111"
        data-tauri-drag-region
        class="h-screen w-screen absolute bg-black/80 backdrop-blur-3xl "
        v-if="mounted && !isSynced"
      >
        <div
          data-tauri-drag-region
          class="absolute bottom-0 w-full select-none text-center p-16 text-white text-xs font-bold mx-auto"
        >
          <a class="hover:opacity-70" href="https://enchantedos.github.io" target="_blank"
            >Made with Enchan<span class="ml-0.5 mr-1.5">⛏</span>ed</a
          >
        </div>
        <div data-tauri-drag-region class="blurscreen max-w-xs">
          <div class="text-4xl text-white pb-3 text-center">
            Enchan<span class="text-purple-500 ml-0.5 mr-3.5">⛏</span>ed<span
              style="text-shadow: none"
              class="text-xs absolute -mt-2 -ml-14 font-bold text-yellow-400"
            ></span
            ><span
              class="text-xs absolute top-0 right-2.5 text-green-400 font-black pop select-none"
              >0.1.0</span
            >
          </div>
          <div
            class="text-lg pb-5 text-center text-green-400 select-none cursor-default"
          >
            Operating System
          </div>
          <div
            class="flex flex-col w-full m-auto max-w-[200px] items-center gap-3"
          >
            <Input
              class="text-white"
              autofocus
              id="url"
              type="url"
              v-model='url'
              @keydown.enter.prevent="initProvider(url)"
              placeholder="Server address"
            />
            <span class='text-white/80 text-xs uppercase'>press enter to connect</span>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div
        style="z-index: 99999999"
        data-tauri-drag-region
        class="h-screen w-screen absolute bg-black/80 backdrop-blur-3xl"
        v-if="!mounted"
      >
        <div data-tauri-drag-region class="blurscreen ">
          <img src="/eip.webp" />
          <div class="progress-loader">
            <div class="progress"></div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <Desktop />
    </transition>
  </div>
</template>
