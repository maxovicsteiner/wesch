const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fs", {
  readDir: (path) => ipcRenderer.invoke("read-dir", path),
  getFileSize: (path) => ipcRenderer.invoke("get-file-size", path),
  getFolderSize: (path) => ipcRenderer.invoke("get-folder-size", path),
  createFile: (path, name) => ipcRenderer.invoke("create-new-file", path, name),
  createFolder: (path, name) =>
    ipcRenderer.invoke("create-new-folder", path, name),
});

contextBridge.exposeInMainWorld("platform", {
  isUnix: () => ipcRenderer.invoke("is-unix"),
});
