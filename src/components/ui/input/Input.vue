<script setup lang="ts">
import { useAttrs } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const { class: className, ...rest } = useAttrs()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input v-model="modelValue" :class="cn('flex h-9 w-full rounded-sm border-2 bg-zinc-200/30 py-1.5 placeholder-black/50 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-gray-500 focus:border-white/50 sm:text-sm sm:leading-6 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className ?? '')" v-bind="rest">
</template>
