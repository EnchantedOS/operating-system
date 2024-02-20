import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import * as Y from "yjs";
import { toast } from "vue-sonner";
import { ref } from "vue";
import useWindow from "@/composables/useWindow.ts";
import { useStorage } from '@vueuse/core'

const doc = new Y.Doc({ gc: true });
export const isSynced = ref(false);
export const isAuth = ref(false);
export const isOp = ref(false);

export const username = useStorage("username", '');

export const token = useStorage("token", "public-access")
export const url = useStorage("url", "ws://localhost:3044")
export const sendStateless = async (payload: string) => {
  provider.sendStateless(payload);
};

const { apps, createWindow } = useWindow();

export const disconnect = () => {
  destroyProvider()
};

export const loginWithTicket = async (ticket: string) => {
  const payload = JSON.stringify({
    type: "login-with-ticket",
    payload: {
      ticket,
    },
  });
  await sendStateless(payload);
};

const GAME_DOC_NAME = "enchanted";

// const { getCountOfWindowsByAppId } = useWindow();

const transformStateless = async (data) => {
  // toast("Stateless data received!", { description: data.payload });
  try {
    const payload = JSON.parse(data.payload);
    switch (payload.type) {
      case "credentials":
        if (!payload.payload.token) return
        token.value = payload.payload.token;
        // extract username from jwt token
        const jwt = payload.payload.token.split(".")[1];
        const decoded = JSON.parse(atob(jwt));

        toast("Logged in as " + decoded.username + "!", {});

        destroyProvider();
        username.value = decoded.username;
        await initProvider(url.value, token.value);

        break;
      default:
        console.error(`Unknown payload type: ${payload.type}`);
    }
  } catch (error) {
    // console.log("error!", error);
  }
};

export let provider: HocuspocusProvider;
export let hocuspocusProviderWebsocket: HocuspocusProviderWebsocket;

export const checkAuth = (app: any) => {
  if ((app?.auth || app?.op) && token.value === "public-access") {
    return false;
  }
  return true;
};

export const logout = async () => {
  username.value = '';
  token.value = "public-access";
  await initProvider(url.value, token.value);
}

export const initProvider = async (newUrl: string, token?: string) => {
  if (hocuspocusProviderWebsocket) hocuspocusProviderWebsocket.destroy()
  if (provider) provider.destroy()

  hocuspocusProviderWebsocket = new HocuspocusProviderWebsocket(
    {
      url: newUrl,
    }
  );


  provider = new HocuspocusProvider({
    websocketProvider: hocuspocusProviderWebsocket,
    // url: "wss://rea.lity.cc/ws", // http://172.20.10.2:5173/
    // url: "ws://localhost:3044", // http://172.20.10.2:5173/
    // url: "/ws", // http://172.20.10.2:5173/
    name: GAME_DOC_NAME,
    document: doc,
    preserveConnection: false,
    token: token || "public-access",
    onOpen() {
      isAuth.value = false;
    },
    onConnect() {
      // …
      toast("Connected to the server!");
    },
    onAuthenticated() {


      // …
      isAuth.value = true;
    },
    onAuthenticationFailed: ({ reason }) => {
      // …
      toast("Connection denied!", { description: reason });
      isAuth.value = false;
    },
    onStatus: ({ status }) => {
      // …
      // appStore.value.status = status;
      console.log("Status: ", status);
    },
    onMessage: ({ event, message }) => {
      // …
      // console.log("onMessage", event, message);
    },
    onOutgoingMessage: ({ message }) => {
      // …
      // console.log("onOutgoingMessage", message);
    },
    onSynced: ({ state }) => {
      // …
      console.log("onSynced", state);
      // toast({title: "Synced…"});
      isSynced.value = true;

      const apps_ = doc.getMap('apps').toJSON();

      // doc.getMap('apps').clear()
      // apps looks like this: { user: { ... }, app1: { ... }, app2: { ... } }
      // i need a array like: [ { ... }, { ... }, { ... } ]
      const appsArray = Object.values(apps_);

      apps.value = appsArray

      apps.value.push({
        single: true,
        title: 'Login',
        start: true,
        app: 'userApp',
        icon: 'https://minotar.net/avatar/steve/64'
      })

      apps.value.push({
        auth: true,
        title: 'Endernet',
        app: 'endernetApp',
        icon: 'items/ender_eye.png'
      })

      apps.value.push({
        auth: true,
        title: 'Server',
        app: 'serverApp',
        icon: 'items/repeater.png'
      })

      // iterate over the apps and create a window for each if start is true
      apps.value.forEach((app: any) => {
        if (app.start) {
          createWindow(app.app)
        }
      })
    },
    onClose: ({ event }) => {
      isSynced.value = false;
      // …
      console.log("onClose", event);
    },
    onDisconnect: ({ event }) => {
      apps.value = []
      isSynced.value = false;
      isAuth.value = false;
      isOp.value = false;
    },
    onDestroy() {
      isSynced.value = false;
      isAuth.value = false;
      isOp.value = false;
      // …
    },
    onAwarenessUpdate: (data) => {
      // …
      // console.log("onAwarenessUpdate", data);
    },
    onAwarenessChange: ({ states }) => {
      // …
      // console.log("onAwarenessChange", states);
    },
    onStateless: (data) => {
      // console.log("onStateless", data.payload);
      transformStateless(data);
    },
  });
};

export const destroyProvider = () => {
  provider.destroy();
};
