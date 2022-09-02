let element
let btnPlay
let glyphPlay

window.parent.addEventListener('player-data',(e)=>{
    console.log(e.detail)
    data = JSON.parse(e.detail)
    
    if(data.url){
        element.src = data.url
    }
    if(data.time){
        element.currentTime = data.time
    }
    if(data.playing == true){
        element.play()
        btnPlay.style.backgroundColor = '#ffa500'
        glyphPlay.classList.remove('glyphicon-play');
        glyphPlay.classList.add('glyphicon-pause');
    }else if(data.playing == false){
        element.pause()
        btnPlay.style.backgroundColor = '#00ff00'
        glyphPlay.classList.remove('glyphicon-pause');
        glyphPlay.classList.add('glyphicon-play');
    }
},false)

window.addEventListener('DOMContentLoaded', () => {
    element = document.getElementById("player")
    btnPlay = document.getElementById("btn-play")
    glyphPlay = document.getElementById("glyph-play")
    window.parent.sendIpc('request-data', 'player-data')
})


