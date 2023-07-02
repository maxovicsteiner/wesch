const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fs", {
  readDir: (path) => ipcRenderer.invoke("read-dir", path),
});
