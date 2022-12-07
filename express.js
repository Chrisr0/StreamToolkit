const express = require('express');
const {Server} = require("socket.io");
const http = require('http')
const path = require('path')

let app = express()
let server = http.createServer(app)
let io = new Server(server)
server.listen(3000);

app.get('/', function(req, res){
   
    res.send('Server is ready!');
    
});

app.get('/fonts/:name', function(req, res){
   
    res.sendFile(path.join(__dirname, 'fonts/'+req.params.name));
    
});

app.get('/song-progress', function(req, res){
   
    res.sendFile(path.join(__dirname, 'express/songProgress.html'));
    
});

io.on("connection", (socket) => {
    socket.on("song-time", (arg) => {
        io.emit("song-time", arg)
    })
    socket.on("request-queue", (arg) => {
        console.log("forwarding queue request")
        io.emit("request-queue", arg)
    })
    socket.on("queue-data", (arg) => {
        io.emit("queue-data", arg)
    })
    socket.on("update-queue", (arg) => {
        io.emit("update-queue", arg)
    })
    socket.on("remove-queue", (arg) => {
        console.log("forwarding queue remove")
        io.emit("remove-queue", arg)
    })
    socket.on("player-next", (arg) => {
        console.log("forwarding queue remove")
        io.emit("player-next", arg)
    })
    socket.on("player-pause", (arg) => {
        console.log("forwarding queue remove")
        io.emit("player-pause", arg)
    })
    socket.on("player-volume", (arg) => {
        console.log("forwarding queue remove")
        io.emit("player-volume", arg)
    })
    socket.on("request-volume", (arg) => {
        console.log("forwarding queue request")
        io.emit("request-volume", arg)
    })
    socket.on("volume-data", (arg) => {
        console.log("forwarding queue request")
        io.emit("volume-data", arg)
    })
    socket.on("addToQueue", (arg) => {
        console.log("forwarding queue request")
        io.emit("addToQueue", arg)
    })
    socket.on("getPath", (arg) => {
        console.log("forwarding getPath")
        io.emit("getPath", arg)
    })
    socket.on("path", (arg) => {
        console.log("forwarding path")
        io.emit("path", arg)
    })
    socket.on("cfg", (arg) => {
        console.log("forwarding cfg")
        io.emit("cfg", arg)
    })
    socket.on("request-config", (arg) => {
        console.log("forwarding config request")
        io.emit("request-config", arg)
    })
    socket.on("save-config", (arg) => {
        console.log("forwarding save request")
        io.emit("save-config", arg)
    })
    socket.on("send-np", (arg) => {
        console.log("forwarding np request")
        io.emit("send-np", arg)
    })
})