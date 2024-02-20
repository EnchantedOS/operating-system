<script setup lang="ts">
import { ReloadIcon } from '@radix-icons/vue'
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button disabled>
    <ReloadIcon class="w-4 h-4 mr-2 animate-spin" />
    Please wait
  </Button>
</template>
