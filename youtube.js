const ytdl = require('ytdl-core');

async function test(){
    let info = await ytdl.getInfo("https://www.youtube.com/watch?v=wDgQdr8ZkTw");
    console.log(info.formats[0].url)
}
test()