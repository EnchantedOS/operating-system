<script setup lang="ts">
import {
  ContextMenuItem,
  type ContextMenuItemEmits,
  type ContextMenuItemProps,
  useEmitAsProps,
} from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps<ContextMenuItemProps & { class?: string; inset?: boolean }>()
const emits = defineEmits<ContextMenuItemEmits>()
</script>

<template>
  <ContextMenuItem
    v-bind="{ ...props, ...useEmitAsProps(emits) }"
    :class="[
      cn(
        'relative flex cursor-default select-none items-center rounded-sm px-1 py-1 text-sm outline-none focus:bg-accent/70 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-6',
        props.class,
      ),
    ]"
  >
    <slot />
  </ContextMenuItem>
</template>
