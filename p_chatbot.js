const { ipcRenderer } = require('electron')

ipcRenderer.on('port', e => {
  // port received, make it globally available.
  window.electronMessagePort = e.ports[0]
  console.log("port")
  window.electronMessagePort.onmessage = messageEvent => {
    console.log(messageEvent.data)
    const element = document.getElementById("field")
      if (element) element.innerText = messageEvent.data

    const type = messageEvent.data.type
    switch (type) {
      case 'sendMessage':
        //console.log(messageEvent.data.video)
        window.sendMessage(messageEvent.data.target, messageEvent.data.text)
        break;    
      default:
        break;
      }
  }
})