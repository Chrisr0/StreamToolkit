// Modules to control application life and create native browser window
const { app, BrowserWindow, MessageChannelMain, ipcMain } = require('electron')
const {autoUpdater} = require("electron-updater");
const path = require('path')
app.disableHardwareAcceleration()
const { io } = require("socket.io-client")

const socket = io("ws://localhost:3000")

socket.on("getPath", (arg) => {
  console.log('send path')
  socket.emit("path", app.getAppPath())
})

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      //preload: path.join(__dirname, 'p_main.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('pages/index.html')
  mainWindow.on("close", ()=>{
    app.quit()
  })
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

const createChatBot = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 100,
      height: 100,
      show: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      }
    })
  
    // and load the index.html of the app.
    mainWindow.loadFile('chatbot.html')
    
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
  }


  ipcMain.on('player-data', (event, json) => {
    console.log(json)
    BrowserWindow.getAllWindows().forEach(window => {
      window.send('player-data', json);
    });
  });

  ipcMain.on('request-data', (event, json) => {
    console.log(json)
    BrowserWindow.getAllWindows().forEach(window => {
      window.send('request-data', json);
    });
  });


  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
      const express = new BrowserWindow({
        width: 200,
        height: 200,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
          //preload: path.join(__dirname, 'p_express.js')
        }
    })

    express.loadFile('express.html')

    await sleep(1000)

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 784,
        minHeight: 500,
        autoHideMenuBar: true,
        webPreferences: {
          preload: path.join(__dirname, 'p_main.js'),
          nodeIntegration: false,
          contextIsolation: false,
          enableRemoteModule: true,
        }
    })
    
      // and load the index.html of the app.
    mainWindow.loadFile('pages/index.html')
    mainWindow.on("close", ()=>{
        app.quit()
    })

    const chatBot = new BrowserWindow({
        width: 200,
        height: 200,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
          preload: path.join(__dirname, 'p_chatbot.js')
        }
    })

    chatBot.loadFile('chatbot.html')

    const ytPlayer = new BrowserWindow({
        width: 200,
        height: 200,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
          preload: path.join(__dirname, 'p_youtube.js')
        }
    })

    ytPlayer.loadFile('youtube.html')

    

  const config = new BrowserWindow({
    width: 200,
    height: 200,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'p_config.js')
    }

    
})

config.loadFile('config.html')

    const { port1, port2 } = new MessageChannelMain()

    chatBot.once('ready-to-show', () => {
        chatBot.webContents.postMessage('port', null, [port1])
    })
    
    ytPlayer.once('ready-to-show', () => {
        ytPlayer.webContents.postMessage('port', null, [port2])
    })

    mainWindow.once('ready-to-show', () => {
      
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    //if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  socket.emit("path", app.getAppPath())
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.