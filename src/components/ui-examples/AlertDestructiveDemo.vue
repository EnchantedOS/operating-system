<script setup lang="ts">
import { ExclamationTriangleIcon } from '@radix-icons/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
</script>

<template>
  <Alert variant="destructive">
    <ExclamationTriangleIcon class="w-4 h-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      Your session has expired. Please log in again.
    </AlertDescription>
  </Alert>
</template>
