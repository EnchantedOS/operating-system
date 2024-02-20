import { reactive, markRaw, ref, computed, Ref } from 'vue'
import { componentMappings } from "./componentsMapping.ts";

export const apps: Ref<any[]> = ref([]);

const windows = reactive([]);
export default function useWindow() {
  // computed property to return all windows grouped by app and sorted by z-index (descending) with minimized windows at the end and a flag to indicate if the app has any minimized windows and a count of windows
  const groupedWindows = computed(() => {
    const grouped = windows.reduce((acc, win) => {
      if (!acc[win.app]) {
        acc[win.app] = {
          windows: [],
          minimized: false,
          count: 0,
          icon: null,
        };
      }
      acc[win.app].windows.push(win);
      acc[win.app].count += 1;
      acc[win.app].minimized = acc[win.app].minimized || win.minimized;
      return acc;
    }, {});
    // Sort by z-index (descending)
    Object.values(grouped).forEach((group) => {
      group.windows.sort((a, b) => b.zIndex - a.zIndex);
    });
    return grouped;
  });

  function createWindow(appName: any, event?: any, scope?: any) {
    // console.log("createWindow", appName, event);

    const appMapping = componentMappings[appName];

    if (!appMapping) {
      console.error(`No component found for app '${appName}'`);
      return;
    }

    if (appMapping.single && getCountOfWindowsByAppId(appName) > 0) {
      console.error(`Single app '${appName}' only one instance allowed`);
      return;
    }

    // max width is screen width
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    const newWindow = {
      id: Date.now(),
      app: appName,
      title: appMapping.title,
      icon: appMapping.icon,
      scope: scope ? scope : "default", // default, app, user
      component: markRaw(appMapping), // Assign the component based on appName
      closable: appMapping.closable,
      zIndex: 1000,
      width: maxWidth > appMapping.width ? appMapping.width : maxWidth,
      height: maxHeight > appMapping.height ? appMapping.height : maxHeight,
      min: false,
      max: false,
      // position on center
      x: (window.innerWidth - 480) / 2,
      y: (window.innerHeight - 500) / 2,
      iconX: event ? event.x : 0,
      iconY: event ? event.y : 0,
    };

    // console.log("createWindow", newWindow);

    const freeSpacePos = findFreeSpace(newWindow.width, newWindow.height);
    if (freeSpacePos) {
      newWindow.x = freeSpacePos.x;
      newWindow.y = freeSpacePos.y;
    } else {
      // Fallback to random position
      newWindow.x = Math.round(
        Math.random() * (window.innerWidth - newWindow.width),
      );
      newWindow.y = Math.round(
        Math.random() * (window.innerHeight - newWindow.height),
      );
    }

    windows.push(newWindow);
  }

  function findFreeSpace(width: Number, height: Number) {
    const buffer = 10; // buffer space between windows to prevent overlap
    let foundPosition = false;
    let randX: Number, randY: Number;

    for (let attempt = 0; attempt < 100; attempt++) {
      // Generate a random position
      randX = Math.round(Math.random() * (window.innerWidth - width));
      randY = Math.round(Math.random() * (window.innerHeight - height));

      // Check if the space at this position is free
      foundPosition = windows.every((win) => {
        return (
          randX + width + buffer < win.x ||
          randX > win.x + win.width + buffer ||
          randY + height + buffer < win.y ||
          randY > win.y + win.height + buffer
        );
      });

      if (foundPosition) {
        break;
      }
    }

    if (foundPosition) {
      return { x: randX, y: randY };
    }

    // If free space wasn't found after several attempts, return null
    return null;
  }

  function isAppRunning(id: any) {
    const index = windows.findIndex((w) => w.id === id);
    if (index !== -1) {
      return true;
    }
    return false;
  }

  function changeIconCoordinates(id: any, iconX: any, iconY: any) {
    const index = windows.findIndex((w) => w.id === id);
    if (index !== -1) {
      windows[index].iconX = iconX;
      windows[index].iconY = iconY;
    }
  }

  function getIconCoordinatesByAppId(id: any) {
    const windowsByApp = windows.filter((win) => win.app === id);
    // give back x y of icon
    return windowsByApp[0] ? {x: windowsByApp[0].iconX, y: windowsByApp[0].iconY} : null;
  }

  function updateWindow(id: any, windowData: any) {
    const index = windows.findIndex((w) => w.id === id);
    if (index !== -1) {
      Object.assign(windows[index], windowData);
    }
  }

  function changeTitle(id: any, title: any) {
    const index = windows.findIndex((w) => w.id === id);
    if (index !== -1) {
      windows[index].title = title;
    }
  }

  function changeIcon(id: any, icon: any) {
    const index = windows.findIndex((w) => w.id === id);
    if (index !== -1) {
      windows[index].icon = icon;
    }
  }

  function closeWindow(id: any) {
    const index = windows.findIndex((w) => w.id === id);
    if (index !== -1) {
      windows.splice(index, 1);
    }
  }

  function focusWindow(id: any) {
    // console.log('focusWindow', id)
    // Increase z-index of the focused window and reset others
    windows.forEach((win) => {
      if (win.id === id) {
        win.zIndex = 1000;
        win.min = false;
      } else {
        win.zIndex -= 1;
      }
    });
  }

  function minimizeWindow(id: any) {
    const windowToMinimize = windows.find((win) => win.id === id);
    if (windowToMinimize) {
      windowToMinimize.min = true;
    }
  }

  function minimizeAllWindows() {
    windows.forEach((win) => {
      win.min = true;
    });
  }

  function minimizeWindowsByAppId(id: any) {
    const windowsByApp = windows.filter((win) => win.app === id);
    windowsByApp.forEach((win) => {
      win.min = true;
    });
  }

  function maximizeWindow(id: any) {
    const windowToMaximize = windows.find((win) => win.id === id);
    if (windowToMaximize) {
      windowToMaximize.max = true;
    }
  }

  function restoreWindow(id: any) {
    const windowToRestore = windows.find((win) => win.id === id);
    if (windowToRestore) {
      windowToRestore.min = false;
      windowToRestore.max = false;
    }
  }

  function circleThroughWindowsByAppId(id: any, direction: any) {
    const apps = windows.map((win) => win.app);
    const currentAppIndex = apps.indexOf(id);
    let nextAppIndex = currentAppIndex + direction;
    if (nextAppIndex < 0) {
      nextAppIndex = apps.length - 1;
    } else if (nextAppIndex >= apps.length) {
      nextAppIndex = 0;
    }
    const nextApp = apps[nextAppIndex];
    focusWindow(nextApp);
  }

  function getCountOfWindowsByAppId(id: any) {
    const windowsByApp = windows.filter((win) => win.app === id);
    return windowsByApp.length;
  }

  function getWindowsByAppId(id: any) {
    const windowsByApp = windows.filter((win) => win.app === id);
    return windowsByApp;
  }

  function getWindowTitleByAppId(id: any) {
    const windowsByApp = windows.filter((win) => win.app === id);
    return windowsByApp[0] ? windowsByApp[0].title : null;
  }

  function getWindowIconByAppId(id: any) {
    const windowsByApp = windows.filter((win) => win.app === id);
    return windowsByApp[0] ? windowsByApp[0].icon : null;
  }

  function cycleThroughWindowsOrCreate(id: any, event?: any, force?: boolean) {
    // console.log("cycleThroughWindowsOrCreate", id, event, force);
    const windowsByApp = windows.filter((win) => win.app === id);

    // console.log(windowsByApp);

    if (windowsByApp.length > 0 && !force) {
      // console.log(windowsByApp.length > 0 && !force);
      const focusedWindow = windowsByApp.find((win) => win.zIndex === 1000);

      if (focusedWindow) {
        // console.log("focusedWindow", focusedWindow);
        // Find the index in the filtered array, not the original windows array.
        const focusedWindowIndex = windowsByApp.indexOf(focusedWindow);
        const nextWindowIndex = (focusedWindowIndex + 1) % windowsByApp.length; // Use modulo for cycling
        // if there is only one window, minimize it
        if (windowsByApp.length === 1) {
          // console.log("minimizeWindow", windowsByApp[0].id);
          if (windowsByApp[0].min) {
            restoreWindow(windowsByApp[0].id);
          } else {
            minimizeWindow(windowsByApp[0].id);
          }
        } else {
          focusWindow(windowsByApp[nextWindowIndex].id); // Focus on the next window in the windowsByApp array
        }
      } else {
        focusWindow(windowsByApp[0].id); // Focus on the first window of the app if none is focused
      }
    } else {
      createWindow(id, event); // Create the window if there are no windows for the app
    }
  }

  function updateWindowPosition(id: any, newPosition: any) {
    const windowToUpdate = windows.find((win) => win.id === id);
    if (windowToUpdate) {
      windowToUpdate.x = newPosition.x;
      windowToUpdate.y = newPosition.y;
    }
  }

  // Call this function when the size changes (e.g., on resize end)
  function updateWindowSize(id: any, newSize: any) {
    const windowToUpdate = windows.find((win) => win.id === id);
    if (windowToUpdate) {
      windowToUpdate.width = newSize.width;
      windowToUpdate.height = newSize.height;
    }
  }

  return {
    apps,
    windows,
    createWindow,
    updateWindow,
    closeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    circleThroughWindowsByAppId,
    groupedWindows,
    getWindowTitleByAppId,
    getWindowIconByAppId,
    changeTitle,
    changeIcon,
    getCountOfWindowsByAppId,
    getWindowsByAppId,
    cycleThroughWindowsOrCreate,
    minimizeAllWindows,
    minimizeWindowsByAppId,
    changeIconCoordinates,
    isAppRunning,
    getIconCoordinatesByAppId
  };
}
