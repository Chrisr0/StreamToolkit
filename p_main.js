const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
})

ipcRenderer.on('port', e => {
  // port received, make it globally available.
  console.log("port")
  window.electronMessagePort = e.ports[0]

  window.electronMessagePort.onmessage = messageEvent => {
    console.log(messageEvent.data)
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

ipcRenderer.on('player-data', (event, json) => {
  console.log("Fired event:" + json)
  const new_event = new CustomEvent('player-data', { detail: json });
  window.dispatchEvent(new_event);

});

window.addEventListener('player-data',(e)=>{
  console.log("Maain")
},false)

window.sendIpc = function (channel, args) {
  ipcRenderer.send(channel, args)
}

window.test = "123"