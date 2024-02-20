<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <tr :class="cn('border-b-2 transition-colors hover:bg-muted/20 data-[state=selected]:bg-opacity-50', props.class)">
    <slot />
  </tr>
</template>
