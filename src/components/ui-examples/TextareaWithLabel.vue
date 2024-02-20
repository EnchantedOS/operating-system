<script setup lang="ts">
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="grid w-full gap-1.5">
    <Label for="message">Your message</Label>
    <Textarea id="message" placeholder="Type your message here." />
  </div>
</template>
