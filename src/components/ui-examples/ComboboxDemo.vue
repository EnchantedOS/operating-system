<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { CaretSortIcon, CheckIcon } from "@radix-icons/vue";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const { modelValue, players } = defineProps({
  modelValue: {
    type: Object as () => { value: string; label: string } | undefined,
    default: undefined,
  },
  players: {
    type: Array as () => Array<{ value: string; label: string }>,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const value = ref(modelValue); // Use the v-model prop as the initial value

const filterFunction = (list: typeof players, search: string) =>
  list.filter((i) => i.value.toLowerCase().includes(search.toLowerCase()));

// Watch for changes in the value ref and emit update:modelValue event
watch(value, (newValue) => {
  emit("update:modelValue", newValue);
});
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-[200px] justify-between"
      >
        {{ value ? value.label : "Select player..." }}
        <CaretSortIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command v-model="value" :filter-function="filterFunction">
        <CommandInput class="h-9" placeholder="Search player..." />
        <CommandEmpty>No player found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="player in players"
              :key="player.value"
              :value="player"
              @select="
                (ev) => {
                  value = ev.detail.value; // Update the ref, which also triggers the watcher
                  open = false;
                }
              "
            >
              {{ player.label }}
              <CheckIcon
                :class="
                  cn(
                    'ml-auto h-4 w-4',
                    value?.value === player.value ? 'opacity-100' : 'opacity-0',
                  )
                "
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
