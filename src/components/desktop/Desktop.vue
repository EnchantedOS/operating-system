<script setup lang="ts">
import Window from "@/components/window/Window.vue";
import { onMounted, ref } from "vue";

import DockItem from "@/components/dock/DockItem.vue";
import useWindow from "@/composables/useWindow.ts";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu, MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
} from '@/components/ui/menubar'
import { disconnect, checkAuth, logout } from '@/store.ts'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'

const {
  apps,
  windows,
  createWindow,
  closeWindow,
  focusWindow,
  minimizeWindow,
  maximizeWindow,
  restoreWindow,
  updateWindowPosition,
  updateWindowSize,
  cycleThroughWindowsOrCreate,
  getCountOfWindowsByAppId,
  getWindowTitleByAppId,
  getWindowIconByAppId,
  changeTitle,
  changeIcon,
  minimizeAllWindows,
  minimizeWindowsByAppId,
} = useWindow();

onMounted(() => {
  window.dispatchEvent(new Event('resize'));

  toast( "Welcome to EnchantedOS!", { description: "Connect to a server to begin." });
});

const reload = () => {
  window.location.reload();
};


const open = () => {
  window.open('https://enchantedos.github.io', '_blank');
}

function findDockItemCoordinatesByAppId(appId: string) {
  // console.log(appId);
  const dockItem = document.getElementById(appId);
  if (dockItem) {
    // console.log(dockItem);
    const dockItemRect = dockItem.getBoundingClientRect();
    return {
      x: dockItemRect.x,
      y: dockItemRect.y,
    };
  } else {
    // console.log("no dock item found");
  }
  return {
    x: 0,
    y: 0,
  };
}
</script>

<template>
  <div id="desktop" class="w-full h-full top-0 left-0 right-0 bottom-0">
    <div v-if='true'
         style="z-index: 999999999" class='absolute top-0 right-0'>
      <Button class='h-8 text-white/90 rounded-none'>
        ⏷
      </Button>
      <Button class='h-8 text-white/90 rounded-none'>
        ⏶
      </Button>
      <Button class='h-8 text-white/90 rounded-none'>
        ❌
      </Button>
    </div>
    <div
      id="title_bar"
      style="z-index: 9999999"
      @contextmenu.prevent="minimizeAllWindows()"
      @touchstart="minimizeAllWindows()"
      data-tauri-drag-region
      class="w-full backdrop-blur bg-zinc-900/50 border-b-2 pointer-events-auto border-white/60 absolute h-[36px]"
    >

      <Menubar :class='{"pl-20": false, "pl-2": true}' data-tauri-drag-region class='bg-transparent rounded-tl-xl rounded-tr-xl text-white'>
        <MenubarMenu>
          <MenubarTrigger>Enchan<span class='ml-0.5 mr-1.5'>⛏</span>ed</MenubarTrigger>
          <MenubarContent>

            <MenubarItem @click='open' >
              About Enchan<span class='ml-0.5 mr-1.5'>⛏</span>edOS
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem @click='disconnect'>
              Disconnect
            </MenubarItem>
            <MenubarItem @click='logout'>
              Logout
            </MenubarItem>
            <MenubarSeparator />

            <MenubarItem @click='reload'>
              Reboot
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
    <div
      id="dock"
      data-tauri-drag-region
      class="w-full flex absolute bottom-2 flex-row justify-center items-center px-1 mb-1 pb-1 h-12"
    >
      <div
        data-tauri-drag-region
        style="max-width: calc(100%); z-index: 9999999"
        class="flex flex-row backdrop-blur pointer-events-auto overflow-y-hidden overflow-x-scroll hidesc ring-black/90 border-2 border-white/60 shadow-md bg-black/30 my-auto px-1 py-1 rounded-md"
      >
        <span v-if='apps.length > 0' data-tauri-drag-region class="flex">
          <dock-item
            v-for="(app, i) in apps"
            :title="getWindowTitleByAppId(app.app) || app.title"
            :icon="getWindowIconByAppId(app.app) || app.icon"
            :id="app.app"
            :key="i.toString()"
            :visible='checkAuth(app)'
            :appCount="getCountOfWindowsByAppId(app.app)"
            @open="cycleThroughWindowsOrCreate(app.app, $event, false)"
            @forceopen="cycleThroughWindowsOrCreate(app.app, $event, true)"
            @close="minimizeWindowsByAppId(app.app)"
          />
        </span>
        <span class='text-white cursor-default select-none text-xs uppercase p-1' v-else>
          no apps on this server
        </span>
      </div>
    </div>
    <div class="pt-56">
      <div class="pointer-events-auto">
        <Toaster :position='"top-right"' />
        <window
          v-for="(window, index) in windows"
          :key="window.id"
          :scope="window.scope"
          :style="{ zIndex: window.zIndex }"
          :height="window.height"
          :width="window.width"
          :title="window.title"
          :icon="window.icon"
          :closable="window.closable"
          :is-modal="window.isModal"
          :min="window.min"
          :max="window.max"
          :hidden="window.hidden"
          :x="window.x"
          :y="window.y"
          :is-focused="window.isFocused"
          :icon-x="window.iconX"
          :icon-y="window.iconY"
          @update:position="updateWindowPosition(window.id, $event)"
          @update:size="updateWindowSize(window.id, $event)"
          @close="closeWindow(window.id)"
          @focus="focusWindow(window.id)"
          @mousedown="focusWindow(window.id)"
          @touchstart="focusWindow(window.id)"
          @minimize="minimizeWindow(window.id)"
          @maximize="maximizeWindow(window.id)"
          @restore="restoreWindow(window.id)"
          @change-title="changeTitle(window.id, $event)"
          @change-icon="changeIcon(window.id, $event)"
        >
          <component :window="window" :key='window.id' :is="window.component.component" />
        </window>
      </div>
    </div>
  </div>
</template>
