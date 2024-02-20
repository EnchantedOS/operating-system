<script setup lang="ts">
import { CheckIcon, PaperPlaneIcon, PlusIcon } from '@radix-icons/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { token, url, username, hocuspocusProviderWebsocket } from '@/store'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

const { window } = defineProps(['window'])

type User = (typeof users.value)[number]

const messages = ref([

])
const scrollArea = ref(null as HTMLDivElement | null)

const open = ref(false)
const selectedUsers = ref<User[]>([])

const doc = new Y.Doc({ gc: true });

// Only establish a new connection if it doesn't exist or reconnect if necessary
let provider: HocuspocusProvider | null = null

onMounted(() => {
  if (!provider) {
    provider = new HocuspocusProvider({
      url: url.value,
      token: token.value,
      name: 'enchanted.chat',
      document: doc,
      onSynced() {
        scrollArea.value.scrollTop = scrollArea.value.scrollHeight
      },
      onAuthenticated() {
        console.log('Authenticated')
      },
    });

    // observe chat messages and push them to the messages array
    doc.getArray('chat').observe(event => {
      event.changes.added.forEach(change => {
        messages.value.push(change.content.getContent()[0])
        nextTick(() => {
          scrollArea.value.scrollTop = scrollArea.value.scrollHeight
        })
      });
    });
  }
});

// Make sure to properly cleanup when the component unmounts to avoid memory leaks
onBeforeUnmount(() => {
  provider?.destroy(); // Adjust this line according to the hocuspocus documentation for proper cleanup
});


const input = ref('')
const inputLength = computed(() => input.value.trim().length)
const users = ref([
  {
    name: 'Olivia Martin',
    email: 'm@example.com',
    avatar: '/avatars/01.png',
  },
  {
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    avatar: '/avatars/03.png',
  },
  {
    name: 'Emma Wilson',
    email: 'emma@example.com',
    avatar: '/avatars/05.png',
  },
  {
    name: 'Jackson Lee',
    email: 'lee@example.com',
    avatar: '/avatars/02.png',
  },
  {
    name: 'William Kim',
    email: 'will@email.com',
    avatar: '/avatars/04.png',
  },
])


</script>

<template>
  <div class=' h-full flex-col'>
    <div style='height: calc(100% - 44px);' class=" flex-grow w-full">
      <ScrollArea class='h-full w-full' ref='scrollArea' >
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="cn(
            'flex flex-row mb-2 mx-1.5 my-1.5',
            message.player === username ? 'ml-auto ' : '',
          )"
        >
          <img v-tippy="{
      content: message.player,
      placement: 'bottom',
    }" v-if='message.player !== username' :src='"https://minotar.net/avatar/"+ message.player' alt='Image' class='w-9 h-9 rounded-none' />
          <span         :class="cn(
            'pl-0 px-3 py-2 text-sm',
            message.player === username ? 'ml-auto bg-primary text-primary-foreground' : 'bg-purple-950 text-primary-foreground',
          )">{{ message.message }}</span>

        </div>
      </ScrollArea>
    </div>
    <div class='flex-none h-8 p-1'>
      <form
        class="flex w-full items-center space-x-2"
        @submit.prevent="() => {
          if (inputLength === 0) return

          provider.sendStateless(JSON.stringify({
            type: 'chat',
            message: input,
          }))

          input = ''
          // scroll to bottom
          $nextTick(() => {
            scrollArea.scrollTop = scrollArea.scrollHeight
          })
        }"
      >
        <Input v-model="input" placeholder="Type a message..." class="flex-1" />
        <Button class="p-2.5 flex items-center justify-center" :disabled="inputLength === 0">
          <PaperPlaneIcon class="w-4 h-4" />
          <span class="sr-only">Send</span>
        </Button>
      </form>
    </div>
  </div>

  <Card v-if='false' class='h-full w-full overflow-y-scroll'>
    <CardHeader style='height: calc(10%)' class="flex flex-row items-center justify-between">
      <div class="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="/avatars/01.png" alt="Image" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div>
          <p class="text-sm font-medium leading-none">
            Sofia Davis
          </p>
          <p class="text-sm text-muted-foreground">
            m@example.com
          </p>
        </div>
      </div>
      <TooltipProvider>
        <Tooltip :delay-duration="200">
          <TooltipTrigger as-child>
            <Button
              variant="outline"
              class="rounded-full p-2.5 flex items-center justify-center"
              @click="open = true"
            >
              <PlusIcon class="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent :side-offset="10">
            New message
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </CardHeader>
    <CardContent style='height: calc(80%)'>

    </CardContent>
    <CardFooter  style='height: calc(10%)'>

    </CardFooter>
  </Card>
</template>
