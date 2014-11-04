/**
 * Created by caroline on 03/11/14.
 */
"use strict";

var Peer = require ("peerjs");
var conn;
function User(elem){
    this.peer = new Peer({host: window.location.hostname, port: 9000, path: '/myapp'});
    this.scene = null;
    this.id=null;
    this.peers = [];
    var that=this;
    this.peer.on('open', function(id){

        that.id=id;
        that.displayId(elem);
    });
    this.peer.on("connection",connect);
}



User.prototype.sendHello =function sendHello(){
    conn.send("hello world");
};

function connect(c){
    conn = c;
    conn.on('data', function(data) {
        // Append the data to body.
        console.log(data);
        //var json=JSON.parse(data);

        document.querySelector('#helloworld').appendChild(document.createTextNode(data));
    });

    conn.on('close', function(err){ console.log(conn.peer + ' has left the chat.') });
}


User.prototype.connectToPeer = function connectToPeer(){
    var c= this.peer.connect(document.querySelector('#pid2').value);
    c.on('open', function(){
        connect(c);
    });
    c.on('error', function(err){ alert(err) });
};

User.prototype.setScene = function setScene(scene){
    this.scene=scene;
};
User.prototype.displayId = function displayId(elem){
    elem.value = this.id;
};


module.exports = User;