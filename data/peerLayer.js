/**
 * Created by caroline on 30/10/14.
 */
//var PeerServer = require('peer').PeerServer;
//var server = new PeerServer({port: 9000, path: '/myapp'});

/*"use strict";
var Peer = require ('peerjs');
var peer1 = new Peer({host: 'localhost', port: 9000, path: '/myapp'});
var peer2 = new Peer({host: 'localhost', port: 9000, path: '/myapp'});
peer1.on('open', function(id){

    document.querySelector('#pid').value=id;
    var c=peer2.connect(id);

    c.on('data', function(data) {
        document.querySelector('#helloworld').appendChild(document.createTextNode(data));
        c.send(' peer1');
    });

});

peer2.on('open', function(id){

    document.querySelector('#pid2').value=id;
    var c=peer1.connect(id);

    c.on('data', function(data) {
        document.querySelector('#helloworld').appendChild(document.createTextNode(data));
        c.send(' peer2');
    });

});

peer1.on('connection', function(connection) {
    connection.on('open', function() {
        // Send 'Hello' on the connection.
        connection.send('Hello1,');
    });
    connection.on('data', function(data) {
        // Append the data to body.
        document.querySelector('#helloworld').appendChild(document.createTextNode(data));
    });

});


peer2.on('connection', function(connection) {
    connection.on('open', function() {
        // Send 'Hello' on the connection.
        connection.send('Hello2,');
    });
    connection.on('data', function(data) {
        // Append the data to body.
        document.querySelector('#helloworld').appendChild(document.createTextNode(data));
    });

});*/


//module.exports;