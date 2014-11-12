/**
 * Created by caroline on 03/11/14.
 */
"use strict";

var Peer = require ("peerjs");
var conn;
function User(viewport){
    this.peer = new Peer({host: window.location.hostname, port: 9000, path: '/myapp'});
    this.viewport = viewport;
    this.id=null;
    this.peers = [];

    this.peer.on('open', function(id){

        document.querySelector('#pid').value=id;


    });
    this.peer.on("connection",connect);
    this.conn=null;




}
function connect(c){
    conn = c;
    conn.on('data', function(data) {
        // Append the data to body.
        console.log(data);
        /* var json=JSON.parse(data);
         test(json);*/
        document.querySelector('#helloworld').appendChild(document.createTextNode(data));
    });

    conn.on('close', function(err){ console.log(conn.peer + ' has left the chat.') });
}

User.prototype.sendHello =function sendHello(){
    conn.send("hello world");
};




User.prototype.connectToPeer = function (id){
        var c= this.peer.connect(id);
        var that=this;
        c.on('open', function(){
            connect(c);
            that.conn = conn;
        });
        c.on('error', function(err){ alert(err) });


};

User.prototype.displayId = function displayId(elem){
    elem.value = this.id;
};



module.exports = User;