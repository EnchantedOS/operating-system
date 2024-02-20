<script setup lang="ts">
import { FontItalicIcon } from '@radix-icons/vue'

import { Toggle } from '@/components/ui/toggle'
</script>

<template>
  <Toggle variant="outline" aria-label="Toggle italic">
    <FontItalicIcon class="w-4 h-4" />
  </Toggle>
</template>
