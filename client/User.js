/**
 * Created by caroline on 03/11/14.
 */
"use strict";

var Peer = require ("peerjs");
var conn;
function User(){
    this.peer = new Peer({host: window.location.hostname, port: 9000, path: '/myapp'});
    this.scene = new Scene();
    this.peer.on('open', function(id){

        document.querySelector('#pid').value=id;


    });
    this.peer.on("connection",connect);
}

function connectToPeer(){

    var c= peer.connect(document.querySelector('#pid2').value);
    c.on('open', function(){
        connect(c);
    });
    c.on('error', function(err){ alert(err) });


}



function connect(c){
    conn = c;
    conn.on('data', function(data) {
        // Append the data to body.
        console.log(data);
        var json=JSON.parse(data);
        test(json);
        document.querySelector('#helloworld').appendChild(document.createTextNode(data));
    });

    conn.on('close', function(err){ alert(conn.peer + ' has left the chat.') });
}

module.exports = User;