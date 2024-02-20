<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <caption :class="cn('mt-4 text-sm text-opacity-50', props.class)">
    <slot />
  </caption>
</template>
