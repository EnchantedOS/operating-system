<template>
  <ContextMenu v-if='visible'>
    <ContextMenuTrigger>
      <div
        v-tippy="{
      content: title,
      placement: 'bottom',
    }"
        :id="id"
        @click="determineClick"
        :class="{ 'flash-animation': flash }"
        class="tooltip select-none flex justify-center items-center border-2 pb-1 mx-1 h-10 w-10 bg-gray-200/50 hover:bg-gray-200/90 backdrop-blur pointer-events-auto rounded-sm ring-2 ring-black"
      >
        <img
          style="margin-top: 1px !important"
          class="m-auto select-none h-8 w-8 rounded-sm"
          draggable="false"
          :src="icon"
        />
        <span class='sticky'><span class="absolute mt-5 -left-9 text-xs flex flex-row items-center justify-center w-9 pointer-events-none gap-0.5 pt-0.5"><span v-for='i in appCount' class='rounded-full bg-lime-300 border border-lime-100/80 w-1.5 h-1.5 block'></span></span></span>
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent class="w-64">
      <ContextMenuItem @click='rightClick' inset>
        Minimize All
      </ContextMenuItem>
<!--      <ContextMenuItem inset >-->
<!--        Close All-->
<!--      </ContextMenuItem>-->
    </ContextMenuContent>
  </ContextMenu>
  <div v-else>
    <div
      v-tippy="{
      content: title + ' (login)',
      placement: 'bottom',
    }"
      :id="id"
      class="tooltip pointer-events-none select-none flex justify-center items-center border-2 pb-1 mx-1 h-10 w-10 bg-gray-200/50 opacity-50 backdrop-blur pointer-events-auto rounded-sm ring-2 ring-black"
    >
      <img
        style="margin-top: 1px !important"
        class="m-auto select-none h-8 w-8 rounded-sm"
        draggable="false"
        :src="icon"
      />
      <span class='sticky'><span class="absolute mt-5 -left-9 text-xs flex flex-row items-center justify-center w-9 pointer-events-none gap-0.5 pt-0.5"><span v-for='i in appCount' class='rounded-full bg-lime-300 border border-lime-100/80 w-1.5 h-1.5 block'></span></span></span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
const flash = ref(false);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  appCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["open", "close", "forceopen", "rightclick"])

let clickTimer = null;

const determineClick = (e) => {
  if (clickTimer === null) {
      singleClick(e);
    clickTimer = setTimeout(() => {
      clickTimer = null;
    }, 200); // Delay for the double click
  } else {
    clearTimeout(clickTimer); // Prevent singleClick from firing
    clickTimer = null;
    doubleClick(e);
  }
};

const doubleClick = (e) => {
  // console.log("double click")
  flash.value = true;
  emit("forceopen", e.target.getBoundingClientRect());
  setTimeout(() => {
    flash.value = false;
  }, 300);
};

const singleClick = (e) => {
  const clickedElementPosition = e.target.getBoundingClientRect();
  // console.log("single click")
  flash.value = true;
  emit("open", clickedElementPosition);
  setTimeout(() => {
    flash.value = false;
  }, 150);
};

const rightClick = () => {
  flash.value = true;
  emit("close");
  setTimeout(() => {
    flash.value = false;
  }, 50);
};
</script>

<style>
@keyframes flash {
  0% {
    background-color: #ffffff;
  }
  50% {
    background-color: rgba(255, 255, 255, 0.46);
  }
  100% {
    background-color: #ffffff;
  }
}
.flash-animation {
  animation: 300ms flash;
}
</style>
