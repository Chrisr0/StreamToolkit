const { io } = require("socket.io-client")
const fsPromises = require("fs").promises;

const socket = io("ws://localhost:3000")

let path
let cfg

window.addEventListener('DOMContentLoaded', () => {
    start()
})

let defConfig = {
    playlistUrl: "",
    progressBarColor: "#9BEED0",
    progressBarBg: "#1A8CF0",
    progressBarW: "500",
    progressBarH: "30",
    titleFontSize:"16",
    titleFontColor: "#FFFFFF",
    titleFontFamily: "Nunito",
    twitchKey:  "",
    twitchChannel: "",
    check: "PASS"
}

async function start(){
    socket.emit("getPath", null)
}

socket.on('path', (args)=>{
    path = args
    init()
})

socket.on('request-config', (args)=>{
    sendCfg()
})

socket.on('save-config', async (args)=>{
    data = JSON.parse(args)
    if(data.check != "PASS"){
        console.error("CONFIG_CHECK_ERROR")
        data = defConfig
    }
    cfg = data
    try {
        await fsPromises.writeFile("cfg.txt",JSON.stringify(data))
    } catch (error) {
        console.error(error)
    }
    sendCfg()
})

async function sendCfg(){
    socket.emit('cfg', JSON.stringify(cfg))
}

async function init(){
    console.log(path)
    let data
    try {
        data = await fsPromises.readFile("cfg.txt",'utf8')
    } catch (error) {
        await fsPromises.writeFile("cfg.txt",JSON.stringify(defConfig))
        data = await fsPromises.readFile("cfg.txt",'utf8')
    }
    
    try {
        cfg = JSON.parse(data)
        if(cfg.check != "PASS"){
            throw "err"
        }
    } catch (error) {
        await fsPromises.writeFile("cfg.txt",JSON.stringify(defConfig))
        cfg = defConfig
    }
    
    sendCfg()
    console.log(cfg)
}