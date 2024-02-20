<script setup lang="ts">
import { UnderlineIcon } from '@radix-icons/vue'

import { Toggle } from '@/components/ui/toggle'
</script>

<template>
  <Toggle aria-label="Toggle italic" disabled>
    <UnderlineIcon class="w-4 h-4" />
  </Toggle>
</template>
