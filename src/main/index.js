const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const { handleReadDir } = require("./apiWrapper.js");
require("dotenv").config();

// Detect platform
const isMac = process.platform === "darwin";

// Dev mode
const devmode = process.env.NODE_ENV === "development";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let menu = [];

function createMainWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "../renderer", "preload.js"),
    },
  });

  let temp = {
    label: "Open Devtools",
    click: () => mainWindow.webContents.openDevTools(),
  };

  menu.push(temp);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../renderer", "index.html"));

  // Open the DevTools.
  if (devmode) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", () => {
  createMainWindow();
  // Remove the menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  // Handle events emitted by ipcRenderer
  ipcMain.handle("read-dir", handleReadDir);

  // For macOs
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
