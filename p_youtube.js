const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { ipcRenderer } = require('electron')
const { io } = require("socket.io-client")
    //"ytdl-core": "github:GreepTheSheep/node-ytdl-core#master",
const socket = io("ws://localhost:3000")

let element
let queue = []
let current; 
let started = false
let requestedPlayer = false;
let requestedConfig = false;
let playlist
let plIndex = 0
let buffer

window.test = function (){
  ipcRenderer.send("player-data", "test");
}

async function loadPlaylist(url){
  plIndex = 0
  playlist = await ytpl(url, { limit: 100 });
  let info = await ytdl.getInfo(playlist.items[plIndex++].shortUrl);
  let format = info.formats.find(element => (element.hasAudio && element.hasVideo));
  buffer = {title: info.videoDetails.title, author: info.videoDetails.author.name, url: format.url}
  console.log(buffer)
}

socket.on('cfg', (args)=>{
  const data = JSON.parse(args)
  if(requestedConfig){element.volume = data.vol/100;requestedConfig=false;socket.emit('volume-data', element.volume)}
  console.log("playlist" + data)
  loadPlaylist(data.playlistUrl)
})

async function start(){
    

    element = document.getElementById("player")
    element.volume = '0.5'

    playNext()
    //if (element) element.src = info.formats[0].url
    element.onended = () => {
      playNext()
    }
    element.ondurationchange = () => {
      sendPlayerData()
    }
    element.onplaying = () => {
      sendPlayerDataState()
    }
    element.onpause = () => {
      sendPlayerDataState()
    }
    element.onwaiting = () => {
      sendPlayerDataState()
    }
    element.ontimeupdate = () => {
      sendPlayerTime()
    }
    //console.log(info.formats[0].url)
    if(requestedPlayer){
      sendPlayerData()
      requestedPlayer = false
    }

    sendQueue()

    started = true;


    requestedConfig = true
    socket.emit('request-config')
}

async function addToQueue(url, target){
  console.log(url);
  let info = await ytdl.getInfo(url);
  console.log(info);
  let title = "Added to queue: " + info.videoDetails.title
  if(target)sendCommand({type: 'sendMessage', text: title, target: target})
  let format = info.formats.find(element => (element.hasAudio && element.hasVideo));
  queue.push({title: info.videoDetails.title, author: info.videoDetails.author.name, url: format.url})
  sendQueue()
  console.log(queue)
  if (element.ended){ 
    playNext()
    return
  }
}

async function playNext(){
  console.log("Next");
  console.log(queue.length);
  if(queue.length > 0){
    console.log("path A")
  let song = queue.shift()
  current = song
  element.src = song.url
  sendQueue()
  }else if(playlist.items.length > 0){
    console.log("path B")
    current = buffer
    console.log(buffer)
    console.log(current)
    element.src = buffer.url
    sendQueue()
    let info = await ytdl.getInfo(playlist.items[plIndex++].shortUrl);
    if(plIndex >= playlist.items.length)
    {
      plIndex = 0
    }
    let format = info.formats.find(element => (element.hasAudio && element.hasVideo));
    buffer = {
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      url: format.url
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
    start()
})

ipcRenderer.on('port', e => {
  // port received, make it globally available.
  console.log("port")
  window.electronMessagePort = e.ports[0]

  window.electronMessagePort.onmessage = messageEvent => {
    const type = messageEvent.data.type
    switch (type) {
      case 'addToQueue':
        //console.log(messageEvent.data.video)
        addToQueue(messageEvent.data.video, messageEvent.data.target)
        break;
    
      default:
        break;
    }
  }
})

ipcRenderer.on('request-data', (e, type) => {
  switch (type) {
    case "player-data":
      if(!started){
        requestedPlayer = true;
        return
      }
      sendPlayerData()
      break;
  
    default:
      break;
  }

})

socket.on("request-queue", (args) => {
  console.log("sending queue data")
  sendQueue()
  
})

socket.on("send-np", (args) => {
  if(!args)return
  let title = "Nothing is playing"
  if(current) title = current.author + " : " + current.title
  sendCommand({type: 'sendMessage', text: title, target: args})
  
})

socket.on("update-queue", (args) => {
  const data = JSON.parse(args)
  console.log("sending queue data")
  queue = data.map(i => queue[i]);
  console.log(queue)
  sendQueue()
})

socket.on("remove-queue", (args) => {
  console.log("RemovE")
  queue.splice(args,1)
  sendQueue()
  
})

socket.on("player-next", (args) => {
  playNext()
})

socket.on("player-volume", (args) => {
  console.log(args)
  element.volume = args
  socket.emit('volume-data', element.volume)
})

socket.on("player-pause", (args) => {
  if(element.paused){
    element.play()
  }
  else{
    element.pause()
  }
    
})

socket.on("request-volume", (args) => {
  socket.emit('volume-data', element.volume)
})

socket.on("addToQueue", (args) => {
  addToQueue(args,null)
})

function sendQueue(){
  let data = JSON.stringify(queue)
  socket.emit("queue-data", data)
}

function sendCommand(data){
  window.electronMessagePort.postMessage(data)  
}

function sendPlayerData(){
  data = {
    title: current.title,
    author: current.author,
    playing: !element.paused,
    url: element.currentSrc,
    time: element.currentTime
  }
  jdata = JSON.stringify(data)
  console.log(jdata);
  ipcRenderer.send('player-data', jdata)
}
function sendPlayerDataState(){
  data = {
    playing: !element.paused,
    time: element.currentTime
  }
  jdata = JSON.stringify(data)
  console.log(data);
  ipcRenderer.send('player-data', jdata)
}
function sendPlayerTime(){
  data = {
    title: current.title,
    author: current.author,
    time: element.currentTime,
    duration: element.duration
  }
  jdata = JSON.stringify(data)
  console.log(data);
  socket.emit('song-time', jdata)
}