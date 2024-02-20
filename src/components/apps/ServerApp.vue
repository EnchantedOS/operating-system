<script setup lang="ts">
import { PlusIcon } from "@radix-icons/vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { token, url } from "@/store";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea'
import Instance from '@/components/apps/server/Instance.vue'

const { window } = defineProps(["window"]);

const instances = ref([]);
const scrollArea = ref(null as HTMLDivElement | null);

const open = ref(false);

const doc = new Y.Doc({ gc: true });

// Only establish a new connection if it doesn't exist or reconnect if necessary
let provider: HocuspocusProvider | null = null;

onMounted(() => {
  if (!provider) {
    provider = new HocuspocusProvider({
      url: url.value,
      token: token.value,
      name: "enchanted.system",
      document: doc,
      onSynced() {
        const instances_ = doc.getMap("instances").toJSON();

        console.log(instances_);

        instances.value = Object.keys(instances_).map((key) => {
          return {
            name: key,
            ...instances_[key],
          };
        });
      },
      onAuthenticated() {
        console.log("Authenticated");
      },
    });
  }
});

// Make sure to properly cleanup when the component unmounts to avoid memory leaks
onBeforeUnmount(() => {
  provider?.destroy(); // Adjust this line according to the hocuspocus documentation for proper cleanup
});

const input = ref("");
const inputLength = computed(() => input.value.trim().length);
</script>

<template>
  <div style='height: calc(100% - 44px);' class="h-full flex-grow w-full">
    <Tabs style="height: 100%!important" default-value="instances" class="pt-2">
      <div class="space-between flex items-center px-2 pb-2 shadow-lg">
        <TabsList>
          <TabsTrigger value="instances" class="relative">
            Instances
          </TabsTrigger>
          <TabsTrigger value="enchantments"> Enchantments </TabsTrigger>
          <TabsTrigger value="live" disabled> Live </TabsTrigger>
        </TabsList>
        <div class="ml-auto mr-1">
          <Button> New Instance </Button>
        </div>
      </div>

      <ScrollArea class='h-full w-full' ref='scrollArea' >
        <TabsContent
          value="instances"
          class="border-none outline-none pl-1"
        >
          <div v-for="instance in instances" class="mb-2 pr-2">
            <Instance :instance="instance" />
          </div>
        </TabsContent>
      </ScrollArea>
    </Tabs>

  </div>

</template>
