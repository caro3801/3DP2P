/**
 * Created by caroline on 31/10/14.
 */
"use strict";

var PeerStore= require ('./peerStore');
function PeerModel(){
    this.connectedPeers = [];
}

PeerModel.prototype.add = function add(id){
  this.connectedPeers.push(id);
};

PeerModel.prototype.remove = function remove(id){

    for (var i = 0; i < this.connectedPeers.length; i++)
        if (this.connectedPeers[i] === id) {
            this.connectedPeers.splice(i, 1);
            break;
        }
};


//module.exports =PeerModel;