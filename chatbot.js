const tmi = require('tmi.js');
const { io } = require("socket.io-client")

const socket = io("ws://localhost:3000")

socket.on('cfg', (args) => {
  const data = JSON.parse(args)
  console.log(data)
  if(!started){
    started = true
    start(data.twitchKey, data.twitchChannel)
  }
})

let client
let started = false

function start(key, channel){
  if(client)return;
// Define configuration options
  const opts = {
    identity: {
      username: 'songrequesthelper',
      password: key
    },
    channels: [
      channel
    ]
  };

  // Create a client with our options
  client = new tmi.client(opts);

  // Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

}


// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.split(' ')[0]
  const args = msg.slice(commandName.length + 1)

  // If the command is known, let's execute it
  if (commandName === '!sr') {
    sendCommand({type: 'addToQueue', video: args, target: target})
    console.log(`* Executed ${commandName} command`);
  } else if (commandName === '!volume') {
    if(!isMod(context)) return;
    let vol = 50
    if(args < 0){
      vol = 0
    }else if(args>100){
      vol = 100
    }else{
      vol = args
    }
    console.log(vol)
    vol = vol/100
    socket.emit('player-volume', vol)
    console.log(`* Executed ${commandName} command`);
  } else if (commandName === '!skip') {
    if(!isMod(context)) return;
    socket.emit('player-next',null)
    console.log(`* Executed ${commandName} command`);
  } else if (commandName === '!np') {
    socket.emit('send-np',target)
    console.log(`* Executed ${commandName} command`);
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

function isMod(context){
  return context["mod"] || context["username"] == client.opts.channels[0].slice(1);
}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function sendCommand(data){
  window.electronMessagePort.postMessage(data)  
}

window.sendMessage = function (target, text) {
  client.say(target,text);
}

window.addEventListener('DOMContentLoaded', () => {
  socket.emit('request-config')
})