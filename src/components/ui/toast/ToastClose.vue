<script setup lang="ts">
import { ToastClose } from 'radix-vue'
import { Cross2Icon } from '@radix-icons/vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <ToastClose v-bind="props" :class="cn('absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600', props.class)">
    <button class="bg-red-500 rounded-xs h-3 w-3 shadow-sm"></button>
  </ToastClose>
</template>
