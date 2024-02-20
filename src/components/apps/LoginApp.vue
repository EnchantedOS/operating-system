<script setup lang="ts">
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label, PinInputInput, PinInputRoot } from "radix-vue";
import { disconnect, loginWithTicket, logout, username } from "@/store.ts";
import { computed, onMounted, ref, watch } from 'vue'
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Instance from "@/components/apps/server/Instance.vue";
import { ScrollArea } from "@/components/ui/scroll-area";

const props = defineProps(["window"]);

const value = ref<string[]>([]);

const pinVisible = ref(true);
const handleComplete = async (e: string[]) => {
  pinVisible.value = false;
  await loginWithTicket(e.join(""));
  value.value = [];
  pinVisible.value = true;
};

const compUsername = computed(() => username.value);

onMounted(() => {
  if (compUsername.value) {
    props.window.title = compUsername.value;
    props.window.icon = `https://minotar.net/avatar/${compUsername.value}/64`;
  }
  watch(compUsername, () => {
    console.log("username", compUsername.value);
    const user = compUsername.value || null;
    props.window.title = user ? user : "Login";
    props.window.icon = `https://minotar.net/avatar/${user ? user : "steve"}/64`;
  });
});

const providerUrl = ref("ws://localhost:3044");
const minecraftUrl = ref("localhost:25565");
</script>

<template>
  <div style="height: calc(100% - 44px)" class="h-full flex-grow w-full p-0.5">
    <Tabs
      style="height: 100% !important"
      default-value="connection"
      class="h-full flex-grow w-full"
    >
      <TabsList class="grid grid-cols-2 rounded-none">
        <!-- We can replace this with dynamic tabs if needed, but for simplicity, we are using two static tabs -->
        <TabsTrigger value="connection">Connection</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <ScrollArea class="h-full w-full px-1" ref="scrollArea">
        <TabsContent value="connection">
          <Card v-if="username === ''">
            <CardTitle class="text-center py-4">
              <h1 class="uppercase font-bold">Connect</h1>
              <span class="text-xs leading-snug">
                Connect to the Minecraft server:
              </span>
            </CardTitle>
            <CardContent>
              <div class="flex items-center justify-center">
                <input
                  v-model="minecraftUrl"
                  class="craft-input w-full select-all"
                  placeholder="ws://localhost:3044"
                />
              </div>
            </CardContent>
          </Card>

          <Card v-if="username === '' && pinVisible">
            <CardTitle class="text-center py-4">
              <h1 class="uppercase font-bold">Ticket</h1>
              <span class="text-xs leading-snug">
                Enter the ticket you received in-game.
              </span>
            </CardTitle>
            <CardContent>
              <div class="flex items-center justify-center">
                <PinInputRoot
                  id="pin-input"
                  v-model="value"
                  placeholder="*"
                  class="flex gap-2 items-center mt-1"
                  @complete="handleComplete"
                >
                  <PinInputInput
                    v-for="(id, index) in 5"
                    :key="id"
                    :index="index"
                    class="w-10 h-10 craft-input uppercase"
                  />
                </PinInputRoot>
              </div>
            </CardContent>
          </Card>

          <Card v-if="username !== ''">
            <CardTitle class="text-center py-4">
              <h1 class="uppercase font-bold">{{ username }}</h1>
            </CardTitle>
            <CardContent>
              <div class="flex items-center gap-2 justify-center">
                <Button
                  @click="
                    () => {
                      logout();
                    }
                  "
                  >Logout</Button
                >
                <Button
                  @click="
                    () => {
                      disconnect();
                    }
                  "
                  >Disconnect</Button
                >
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent class="grid gap-6 pt-6">
              <div
                v-if="true"
                class="flex items-center justify-between space-x-2"
              >
                <Label for="necessary" class="flex flex-col space-y-1">
                  <span class="uppercase font-bold">Strictly Necessary</span>
                  <span class="text-xs leading-snug">
                    These cookies are essential in order to use the app and use
                    its features.
                  </span>
                </Label>
                <Switch disabled id="necessary" default-checked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  </div>
</template>
