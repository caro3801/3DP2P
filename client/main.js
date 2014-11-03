"use strict";

document.addEventListener("DOMContentLoaded",function(event){


    document.querySelector("#addCube").addEventListener("click",function(){
        addCube();
        if(conn){
            conn.send(
                JSON.stringify({"action":"addCube"})
            );
        }
        render();
    },false);
    document.querySelector("#importScene").addEventListener("click",function(){importScene();render();},false);
    document.querySelector("#exportScene").addEventListener("click",function(){exportScene();},false);
    document.querySelector("#connect").addEventListener("click",connectToPeer,false);
    document.querySelector("#sendButton").addEventListener("click", sendHello,false);
    elem   = document.querySelector("#container");
    widthC  = elem.offsetWidth;
    heightC = elem.offsetHeight;
    init();
    animate();

module.exports;