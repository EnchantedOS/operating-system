<script setup lang="ts">
import { FontBoldIcon } from '@radix-icons/vue'

import { Toggle } from '@/components/ui/toggle'
</script>

<template>
  <Toggle aria-label="Toggle italic">
    <FontBoldIcon class="h-4 w-4" />
  </Toggle>
</template>
