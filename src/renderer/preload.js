const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fs", {
  readDir: (path) => ipcRenderer.invoke("read-dir", path),
  getFileSize: (path) => ipcRenderer.invoke("get-file-size", path),
  getFolderSize: (path) => ipcRenderer.invoke("get-folder-size", path),
});
