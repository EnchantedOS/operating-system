<template>
  <div
    v-show="!hidden"
    class="winbox pointer-events-auto absolute"
    :class="{
      focus: isFocused,
      animated: !isDragging && !isResizing,
      darkgray: isDark,
      min: isMinimized,
      max: isMaximized,
      modal: isModal,
    }"
    :style="{
      width: isMinimized ? 10 + 'px' : width + 'px',
      height: isMinimized ? 10 + 'px' : height + 'px',
      top: isMinimized ? iconY + 'px' : y + 'px',
      left: isMinimized ? iconX + 'px' : x + 'px',
    }"
  >
    <div
      v-if="!isMinimized"
      class="wb-header"
      @dblclick="toggleMaximize()"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @touchend="handleTap()"
    >
      <div class="wb-drag flex flex-row justify-end items-end">
        <div
          class="wb-icon rounded-sm"
          v-if="icon"
          :style="{ backgroundImage: 'url(' + icon + ')' }"
        ></div>
        <div class="wb-title flex-grow my-2">{{ title }}</div>
        <div class="wb-controls">
          <button
            class="wb-min"
            @click.prevent.stop="toggleMinimize"
            @touchend.prevent.stop="toggleMinimize"
          ></button>
          <button
            class="wb-max"
            @click.prevent.stop="toggleMaximize"
            @touchend.prevent.stop="toggleMaximize"
          ></button>
          <button
            v-if="isClosable"
            class="wb-close"
            @click.prevent.stop="close"
            @dragstart.prevent.self
            @touchend.prevent.stop="close"
          ></button>
        </div>
      </div>
    </div>

    <div class="wb-body rounded-b-sm" :class="{ hidden: isMinimized }">
      <slot></slot>
    </div>
    <div
      v-if="!isMaximized"
      class="resize-handle n"
      @mousedown.prevent.stop="startResize('n')"
      @touchstart.prevent.stop="startResize('n')"
    ></div>
    <div
      v-if="!isMaximized"
      class="resize-handle s"
      @mousedown.prevent.stop="startResize('s')"
      @touchstart.prevent.stop="startResize('s')"
    ></div>
    <div
      v-if="!isMaximized"
      class="resize-handle w"
      @mousedown.prevent.stop="startResize('w')"
      @touchstart.prevent.stop="startResize('w')"
    ></div>
    <div
      v-if="!isMaximized"
      class="resize-handle e"
      @mousedown.prevent.stop="startResize('e')"
      @touchstart.prevent.stop="startResize('e')"
    ></div>
    <div
      v-if="!isMaximized"
      class="resize-handle nw"
      @mousedown.prevent.stop="startResize('nw')"
      @touchstart.prevent.stop="startResize('nw')"
    ></div>
    <div
      v-if="!isMaximized"
      class="resize-handle ne"
      @mousedown.prevent.stop="startResize('ne')"
      @touchstart.prevent.stop="startResize('ne')"
    ></div>
    <div
      v-if="!isMaximized"
      class="resize-handle sw"
      @mousedown.prevent.stop="startResize('sw')"
      @touchstart.prevent.stop="startResize('sw')"
    ></div>
    <div
      v-if="!isMaximized"
      class="resize-handle se"
      @mousedown.prevent.stop="startResize('se')"
      @touchstart.prevent.stop="startResize('se')"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";
import {
  usePreferredDark,
  useScreenOrientation,
  useScreenSafeArea,
} from "@vueuse/core";
const isDark = usePreferredDark();
const { isSupported, orientation, angle, lockOrientation, unlockOrientation } =
  useScreenOrientation();
const { top, right, bottom, left } = useScreenSafeArea();

const props = defineProps({
  width: Number,
  height: Number,
  title: String,
  icon: String,
  closable: Boolean,
  scope: String,
  isModal: Boolean,
  min: Boolean,
  max: Boolean,
  hidden: Boolean,
  x: Number,
  y: Number,
  iconX: Number,
  iconY: Number,
});

const emit = defineEmits([
  "close",
  "focus",
  "blur",
  "move",
  "resize",
  "minimize",
  "maximize",
  "fullscreen",
  "restore",
  "change-title",
  "change-icon",
  "update:position",
  "update:size",
]);

const scope = ref(props.scope);
const width = ref(props.width);
const height = ref(props.height);
const x = ref(props.x);
const y = ref(props.y);
const iconX = ref(props.iconX);
const iconY = ref(props.iconY);
const isMinimized = ref(props.min);
const isMaximized = ref(props.max);
const isClosable = ref(props.closable);
const isFullscreen = ref(false);
const hidden = ref(props.hidden);
const zIndexValue = ref(1000);
let isFocused = ref(false);
let isDragging = ref(false);
let isResizing = ref(false);
const topSafeArea = computed(() => parseInt(top.value, 20) || 37);
const bottomSafeArea = computed(() => parseInt(bottom.value, 10) || 61);
const prevX = ref(0);
const prevY = ref(0);
const prevWidth = ref(0);
const prevHeight = ref(0);

// Snapping threshold from the window edges
const snapThreshold = 60; // in pixels
let lastTapTime = 0;

const zIndexCounter = ref(1000);

function handleTap(event) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;
  if (tapLength < 300 && tapLength > 0) {
    // Detected a double tap
    toggleMaximize();
  }

  lastTapTime = currentTime;
}

// watch props for changes
// watch(
//   () => props.width,
//   (newWidth) => {
//     width.value = newWidth;
//   },
// );
// watch(
//   () => props.height,
//   (newHeight) => {
//     height.value = newHeight;
//   },
// );
// watch(
//   () => props.x,
//   (newX) => {
//     x.value = newX;
//   },
// );
// watch(
//   () => props.y,
//   (newY) => {
//     y.value = newY;
//   },
// );
watch(
  () => props.min,
  (newMin) => {
    isMinimized.value = newMin;
  },
);
watch(
  () => props.max,
  (newMax) => {
    isMaximized.value = newMax;
  },
);

// Helper function to ensure the winbox stays in bounds
function ensureInBounds() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const winboxWidth = width.value;
  const winboxHeight = height.value;

  // Prevent going outside the right and bottom edges
  if (x.value + winboxWidth > windowWidth) {
    x.value = windowWidth - winboxWidth;
  }

  // Adjust for the safe area at the bottom if the window is too large
  if (y.value + winboxHeight + bottomSafeArea.value > windowHeight) {
    y.value = windowHeight - winboxHeight - bottomSafeArea.value;
  }

  // Prevent going outside the left and top edges
  if (x.value < 0) {
    x.value = 0;
  }
  // Prevent going outside the top edge considering safe area
  if (y.value < topSafeArea.value) {
    y.value = topSafeArea.value;
  }
}

function getPosition(event) {
  // Helper function to extract position from mouse or touch event
  const isTouchEvent = event.type.includes("touch");
  const position = isTouchEvent
    ? event.touches[0] || event.changedTouches[0]
    : event;
  return {
    x: position.clientX,
    y: position.clientY,
  };
}

function startDrag(event) {
  if (true) {
    const start = getPosition(event);
    const startX = start.x;
    const startY = start.y;
    const startLeft = x.value;
    const startTop = y.value;

    isDragging.value = true;

    const onMove = (moveEvent) => {
      if (isMaximized.value) {
        width.value = prevWidth.value;
        height.value = prevHeight.value;
        isMaximized.value = false;
      }

      const current = getPosition(moveEvent);
      let newX = startLeft + current.x - startX;
      let newY = startTop + current.y - startY;

      x.value = newX;
      y.value = newY;

      emit("move", { x: x.value, y: y.value });
    };

    const onEnd = (endEvent) => {
      const end = getPosition(endEvent);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);

      const startLeft = x.value;
      const startTop = y.value;

      isDragging.value = false;

      let newX = startLeft + end.x - startX;
      let newY = startTop + end.y - startY;

      if (shouldSnapToEdge(end.x, end.y, newX, newY)) {
        snapToEdge(newX, newY);
      }
      // snapToEdge(end.x, end.y);

      emitUpdatePosition(newX, newY);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);

    event.preventDefault();
  }
}

const narrowScreenWidth = 768; // Define a threshold for narrow screens

function shouldSnapToEdge(cursorX, cursorY, winboxX, winboxY) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Determine if we are on a narrow screen
  const isNarrowScreen = windowWidth < narrowScreenWidth;

  // Check if cursor is near the borders
  const nearLeftEdge = cursorX <= snapThreshold;
  const nearRightEdge = cursorX >= windowWidth - snapThreshold;
  const nearTopEdge = cursorY <= snapThreshold;
  const nearBottomEdge = cursorY >= windowHeight - snapThreshold;

  // Check if winbox is close enough to the borders to snap
  const snapToLeft = winboxX <= snapThreshold;
  const snapToRight = windowWidth - (winboxX + width.value) <= snapThreshold;
  const snapToTop = winboxY <= snapThreshold;
  const snapToBottom = windowHeight - (winboxY + height.value) <= snapThreshold;

  if (isNarrowScreen) {
    // On narrow screens, only allow snapping to the top or bottom edges
    return (
      (nearLeftEdge && snapToLeft) ||
      (nearRightEdge && snapToRight) ||
      (nearTopEdge && snapToTop) ||
      (nearBottomEdge && snapToBottom)
    );
  } else {
    // On wider screens, allow snapping to all edges
    return (
      (nearLeftEdge && snapToLeft) ||
      (nearRightEdge && snapToRight) ||
      (nearTopEdge && snapToTop) ||
      (nearBottomEdge && snapToBottom)
    );
  }
}

function snapToEdge(newX, newY) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const safeWindowHeight =
    windowHeight - topSafeArea.value - bottomSafeArea.value;

  // Determine if we are on a narrow screen
  const isNarrowScreen = windowWidth < narrowScreenWidth;

  // Adjust position to snap to edges with safe area consideration for top and bottom
  if (newY <= snapThreshold) y.value = topSafeArea.value;
  if (newY >= windowHeight - height.value - snapThreshold)
    y.value = windowHeight - height.value - bottomSafeArea.value;

  if (isNarrowScreen) {
    // Adjust position to snap to edges with safe area consideration
    if (newX <= snapThreshold) x.value = 0;
    if (newX >= windowWidth - width.value - snapThreshold)
      x.value = windowWidth - width.value;
    if (newY <= snapThreshold) y.value = topSafeArea.value; // Use the topSafeArea
    if (newY >= windowHeight - height.value - snapThreshold)
      y.value = windowHeight - height.value - bottomSafeArea.value; // Use the bottomSafeArea

    // Adjust size if winbox is snapped to top, then maximize, on the left and right, snap to half width and on the corners snap to half width and height
    if (newX <= snapThreshold && newY >= snapThreshold) {
      // Left edge
      toggleMinimize();
      // console.log("Left edge");
    } else if (
      newX >= windowWidth / 2 - snapThreshold &&
      newY >= snapThreshold
    ) {
      // Right edge
      toggleMaximize();
      // console.log("Right edge");
    } else if (newY <= snapThreshold) {
      // Top edge
      toggleMaximize();
    } else if (newY >= safeWindowHeight / 2 - snapThreshold) {
      // Bottom edge
      toggleMaximize();
    }
  } else {
    // Adjust position to snap to edges with safe area consideration
    if (newX <= snapThreshold) x.value = 0;
    if (newX >= windowWidth - width.value - snapThreshold)
      x.value = windowWidth - width.value;
    if (newY <= snapThreshold) y.value = topSafeArea.value; // Use the topSafeArea
    if (newY >= windowHeight - height.value - snapThreshold)
      y.value = windowHeight - height.value - bottomSafeArea.value; // Use the bottomSafeArea

    // Adjust size if winbox is snapped to top, then maximize, on the left and right, snap to half width and on the corners snap to half width and height
    if (newX <= snapThreshold) {
      if (newY <= snapThreshold) {
        // Top left corner
        width.value = windowWidth / 2;
        height.value = safeWindowHeight / 2;
        // console.log("Top left corner");
      } else if (newY >= safeWindowHeight / 2 - snapThreshold) {
        // Bottom left corner
        width.value = windowWidth / 2;
        height.value = safeWindowHeight / 2;
        y.value = safeWindowHeight - height.value + topSafeArea.value;
        // console.log("Bottom left corner");
      } else {
        // Left edge
        width.value = windowWidth / 2;
        height.value = safeWindowHeight;
        y.value = topSafeArea.value;
        // console.log("Left edge");
      }
    } else if (newX >= windowWidth / 2 - snapThreshold) {
      if (newY <= snapThreshold) {
        // Top right corner
        width.value = windowWidth / 2;
        height.value = safeWindowHeight / 2;
        x.value = windowWidth - width.value;
        // console.log("Top right corner");
      } else if (newY >= safeWindowHeight / 2 - snapThreshold) {
        // Bottom right corner
        width.value = windowWidth / 2;
        height.value = safeWindowHeight / 2;
        x.value = windowWidth - width.value;
        y.value = safeWindowHeight - height.value + topSafeArea.value;
        // console.log("Bottom right corner");
      } else {
        // Right edge
        width.value = windowWidth / 2;
        height.value = safeWindowHeight;
        x.value = windowWidth - width.value;
        y.value = topSafeArea.value;
        // console.log("Right edge");
      }
    } else if (newY <= snapThreshold) {
      // Top edge
      height.value = safeWindowHeight;
      width.value = windowWidth;
      x.value = 0;
      y.value = topSafeArea.value;
    } else if (newY >= safeWindowHeight / 2 - snapThreshold) {
      // Bottom edge
      height.value = safeWindowHeight / 2;
      y.value = safeWindowHeight - height.value;
    }
  }

  emitUpdateSize(width.value, height.value);
  emitUpdatePosition(x.value, y.value);

  ensureInBounds();
  emit("resize", { width: width.value, height: height.value });
}

function startResize(direction) {
  const onMouseMove = (moveEvent) => {
    const current = getPosition(moveEvent);
    const deltaX = current.x - prevX.value;
    const deltaY = current.y - prevY.value;

    isResizing.value = true;

    let newWidth = width.value;
    let newHeight = height.value;
    let newX = x.value;
    let newY = y.value;

    switch (direction) {
      case "n":
        if (newHeight - deltaY >= 300) {
          newHeight -= deltaY;
          newY += deltaY;
        }
        break;
      case "s":
        if (newHeight + deltaY >= 300) {
          newHeight += deltaY;
        }
        break;
      case "w":
        if (newWidth - deltaX >= 300) {
          newWidth -= deltaX;
          newX += deltaX;
        }
        break;
      case "e":
        if (newWidth + deltaX >= 300) {
          newWidth += deltaX;
        }
        break;
      case "nw":
        if (newWidth - deltaX >= 300) {
          newWidth -= deltaX;
          newX += deltaX;
        }
        if (newHeight - deltaY >= 300) {
          newHeight -= deltaY;
          newY += deltaY;
        }
        break;
      case "ne":
        if (newWidth + deltaX >= 300) {
          newWidth += deltaX;
        }
        if (newHeight - deltaY >= 300) {
          newHeight -= deltaY;
          newY += deltaY;
        }
        break;
      case "sw":
        if (newWidth - deltaX >= 300) {
          newWidth -= deltaX;
          newX += deltaX;
        }
        if (newHeight + deltaY >= 300) {
          newHeight += deltaY;
        }
        break;
      case "se":
        if (newWidth + deltaX >= 300) {
          newWidth += deltaX;
        }
        if (newHeight + deltaY >= 300) {
          newHeight += deltaY;
        }
        break;
    }

    width.value = newWidth;
    height.value = newHeight;
    x.value = newX;
    y.value = newY;

    prevX.value = current.x;
    prevY.value = current.y;

    // Ensure the window is still within bounds after resizing
    ensureInBounds();

    emit("resize", { width: width.value, height: height.value });
  };

  const onStartPos = getPosition(event);
  prevX.value = onStartPos.x;
  prevY.value = onStartPos.y;

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("touchmove", onMouseMove);
    document.removeEventListener("touchend", onMouseUp);
    isResizing.value = false;
    emitUpdateSize(width.value, height.value);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("touchmove", onMouseMove, { passive: false });
  document.addEventListener("touchend", onMouseUp);
}

function emitUpdatePosition(x, y) {
  emit("update:position", { x, y });
}

function emitUpdateSize(width, height) {
  emit("update:size", { width, height });
}

function toggleMaximize() {
  if (isMaximized.value) {
    // Exiting fullscreen, restore the size and positions
    width.value = prevWidth.value;
    height.value = prevHeight.value;
    x.value = prevX.value;
    y.value = prevY.value;
    isMaximized.value = false;
    emit("restore");
  } else {
    // Store the current positions
    prevX.value = x.value;
    prevY.value = y.value;
    prevWidth.value = width.value;
    prevHeight.value = height.value;
    // Set the window to fullscreen dimensions
    width.value = window.innerWidth;
    height.value =
      window.innerHeight - topSafeArea.value - bottomSafeArea.value;
    x.value = 0;
    y.value = topSafeArea.value;
    isMaximized.value = true;
    emit("maximize");
  }
}

// watch([x, y], ([newX, newY], [oldX, oldY]) => {
//   ensureInBounds();
// });

const onResize = () => {
  if (isMaximized.value) {
    // If the winbox is maximized, update its size to match the new window dimensions
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  } else {
    // Otherwise, ensure the winbox is within the new viewport bounds
    ensureInBounds();
  }
  emit("resize", { width: width.value, height: height.value }); // Emit a resize event if you have associated handlers
};

function toggleMinimize() {
  isMinimized.value = !isMinimized.value;
  if (isMinimized.value) {
    emit("minimize");
  } else {
    emit("restore");
  }
  // additional logic to handle state change
}

function toggleMaximize2() {
  isMaximized.value = !isMaximized.value;
  if (isMaximized.value) {
    width.value = window.innerWidth; // simplistic example
    height.value = window.innerHeight; // simplistic example
    emit("maximize");
  } else {
    width.value = props.initialWidth;
    height.value = props.initialHeight;
    emit("restore");
  }
  // additional logic to handle state change
}

function close() {
  hidden.value = true;
  emit("close");
}

function focus() {
  zIndexValue.value++;
  if (!isFocused.value) {
    // console.log("focus");
    isFocused.value = true;
    emit("focus");
  }
  // additional logic to handle state change
}

function blur() {
  if (isFocused.value) {
    isFocused.value = false;
    zIndexValue.value = 0;
    emit("blur");
  }
  // additional logic to handle state change
}

onMounted(() => {
  emit("focus");
  ensureInBounds();
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  blur();
});
</script>

<style scoped>
.winbox {
  position: absolute;
  user-select: none;
}

.winbox.animated {
  transition:
    all 0.2s ease,
    opacity 0.6s ease;
}

.wb-body {
  overflow: hidden!important; /* allows content scrolling */
  height: calc(100% - 34px);
}

.resize-handle {
  position: absolute;
  cursor: nwse-resize; /* just an example */
}

/* Additional styling */

/* Handling focused state */
.winbox.focus {
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.25),
    0 10px 10px rgba(0, 0, 0, 0.22);
}

/* Handling maximized state */
.winbox.max {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* Handling maximized state */
.winbox.min {
  opacity: 0;
}

.winbox {
  background: rgba(185, 185, 185, 0.9);
  backdrop-filter: blur(5px);
  border: 2px solid rgba(231, 231, 231, 0.6);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.25),
    0 10px 10px rgba(0, 0, 0, 0.11);
  border-style: inset;
  border-radius: 4px;
}
.wb-title {
  color: rgba(37, 36, 36, 0.96);
  text-shadow: #c7c7c7 2px 2px;
  text-align: center;
  font-size: 11px !important;
  font-weight: bold;
}
.wb-controls {
  margin-right: 8px;
}
.wb-body {
  background: rgba(220, 220, 220, 0.5);
  overflow-y: auto;
}

.winbox.darkgray {
  background: #313131;
  backdrop-filter: blur(5px);
  border: 2px solid rgba(231, 231, 231, 0.6);
  border-style: inset;
  border-radius: 4px;
}
.winbox.darkgray .wb-title {
  color: rgba(255, 255, 255, 0.91);
  text-shadow: #8a8a8a 2px 2px;
  text-align: center;
  font-size: 11px !important;
  font-weight: bold;
}
.winbox.darkgray .wb-control {
  margin-right: 8px;
}
.winbox.darkgray .wb-body {
  background: #3f3f3f;
  color: rgba(255, 255, 255, 0.91);
}
.winbox.darkgray.min {
  transform: translateY(36px);
}

.wb-full {
  display: none;
}

.wb-min {
  background-image: none;
  background-color: #ffb20f;
  border-radius: 2px;
  margin: 10px 3px;
  height: 14px;
  width: 14px;
  border: rgba(243, 244, 246, 0.3) 1px solid;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 2px;
}

.wb-max {
  background-image: none;
  background-color: #67d948;
  border-radius: 2px;
  margin: 10px 3px;
  height: 14px;
  width: 14px;
  border: rgba(243, 244, 246, 0.3) 1px solid;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 2px;
}

.wb-close {
  background-image: none;
  background-color: #f7584a;
  border-radius: 2px;
  margin: 10px 3px;
  height: 14px;
  width: 14px;
  border: rgba(243, 244, 246, 0.3) 1px solid;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 2px;
}

.wb-drag {
  cursor: default;
}

.wb-close:hover,
.wb-max:hover,
.wb-min:hover {
  box-shadow: rgba(0, 0, 0, 0.1) 1px 2px;
}

.wb-close:active,
.wb-max:active,
.wb-min:active {
  box-shadow: rgba(0, 0, 0, 0.1) 1px 3px;
  transform: translateY(1px);
}
.winbox .resize-handle {
  position: absolute;
  background-color: rgba(
    255,
    255,
    255,
    0
  ); /* Visible but slightly transparent */
  z-index: 10;
}

/* Top resize handle */
.winbox .resize-handle.n {
  width: 100%;
  height: 5px;
  top: 0;
  margin-top: -4px;
  cursor: ns-resize;
}

/* Right resize handle */
.winbox .resize-handle.e {
  width: 5px;
  height: 100%;
  right: 0;
  top: 0;
  margin-top: -4px;
  margin-right: -4px;
  cursor: ew-resize;
}

/* Bottom resize handle */
.winbox .resize-handle.s {
  width: 100%;
  height: 5px;
  bottom: 0;
  margin-bottom: -4px;
  cursor: ns-resize;
}

/* Left resize handle */
.winbox .resize-handle.w {
  width: 5px;
  height: 100%;
  left: 0;
  top: 0;
  margin-top: -4px;
  margin-left: -4px;
  cursor: ew-resize;
}

/* Top-left corner resize handle */
.winbox .resize-handle.nw {
  width: 10px;
  height: 10px;
  top: 0;
  left: 0;
  margin-top: -4px;
  margin-left: -4px;
  cursor: nwse-resize;
}

/* Top-right corner resize handle */
.winbox .resize-handle.ne {
  width: 10px;
  height: 10px;
  top: 0;
  right: 0;
  margin-top: -4px;
  margin-right: -4px;
  cursor: nesw-resize;
}

/* Bottom-right corner resize handle */
.winbox .resize-handle.se {
  width: 10px;
  height: 10px;
  bottom: 0;
  right: 0;
  margin-right: -4px;
  margin-bottom: -4px;
  cursor: nwse-resize;
}

/* Bottom-left corner resize handle */
.winbox .resize-handle.sw {
  width: 10px;
  height: 10px;
  bottom: 0;
  left: 0;
  margin-left: -4px;
  margin-bottom: -4px;
  cursor: nesw-resize;
}

.wb-icon {
  display: block;
  width: 21px;
  height: 21px;
  margin-left: 6px;
  margin-right: 15px;
  margin-top: 6px;
  margin-bottom: auto;
  float: left;
  background-size: 100%;
  background-position: center;
}
</style>
