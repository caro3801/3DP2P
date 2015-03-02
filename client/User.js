/**
 * Created by caroline on 03/11/14.
 */
"use strict";
var THREE = require('three');
var Peer = require("peerjs");
var XHR = require("./XHR");
var camerasId = {};
function User(editor, viewport, toolbar) {
    this.peers = {};
    this.peer = new Peer({host: window.location.hostname, port: 9000, path: '/myapp'});
    var peer = this.peer;
    var that = this;


    this.peer.on('open', function (id) {
        console.log("my name is : " + id);
        var myname=document.querySelector('#pid');
        myname.value = id;
        peer.on('connection', function (connp) {
            that.peers[connp.peer] = connp;
            that.listen(connp.peer);
        })
    });


    this.peer.editor = editor;
    this.peer.viewport = viewport;
    this.peer.toolbar = toolbar;


    var oCamera = this.peer.editor.camera.clone();
    var oldPos;
    var curr = 0;
    var i = 0;
    this.peer.viewport.signals.cameraSwitched.add(function (currCam) {

        var size = Object.keys(camerasId).length;
        if (i < size) {
            oCamera.position.copy(currCam.position);
            oCamera.rotation.copy(currCam.rotation);
            var tmp = camerasId[Object.keys(camerasId)[i]];
            currCam.position.copy(tmp.position);
            currCam.rotation.copy(tmp.rotation);
            i++;
        } else if (i == size) {

            currCam.position.copy(oCamera.position);
            currCam.rotation.copy(oCamera.rotation);
            i = 0;
        }

        editor.signals.cameraChanged.dispatch(oCamera);
    });
}

User.prototype.connect = function (peerId) {
    this.peers[peerId] = this.peer.connect(peerId);
    this.listen(peerId);
};

User.prototype.listen = function (peerId) {
    var that = this;

    this.addSendToSignal(this.peers[peerId]);

    this.peers[peerId].on('data', function (data) {

        var result = null;
        if (data.message != null) {

            var loader = new THREE.ObjectLoader();
            result = loader.parse(data.message);
        }
        switch (data.type) {
            case 'objectAdded':
                that.peer.editor.addObject(result);
                break;
            case 'dropEnded':
                that.peer.editor.addObject(result);
                break;
            case 'objectSelected':
                result != null ? that.peer.editor.selectByUuid(result.uuid) : that.peer.editor.deselect();
                break;
            case 'objectFocused':
                that.peer.editor.focus(result);

                break;
            case 'objectRemoved':

                that.peer.editor.selectByUuid(result.uuid);

                var object = that.peer.editor.selected;

                var parent = object.parent;

                that.peer.editor.removeObject(object);

                that.peer.editor.select(parent);
                break;
            case 'cameraChanged':
                if (result instanceof THREE.Camera) {
                    if(camerasId[this.peer]){
                        //update camera
                        that.peer.editor.getByUuid(result.uuid);
                        that.peer.editor.current.position.copy(result.position);
                        that.peer.editor.current.rotation.copy(result.rotation);
                        that.peer.editor.signals.objectChanged.dispatch(that.peer.editor.current);

                    }else {
                       // add camera
                        camerasId[this.peer] = result;
                        result.near = 0.01;
                        result.far = 1;
                        result.aspect = 4 / 3;
                        result.updateProjectionMatrix();
                        that.peer.editor.addObject(result);
                    }
                    /*var cam = camerasId[result.uuid];

                    if (cam) {

                        that.peer.editor.getByUuid(result.uuid);
                        that.peer.editor.current.position.copy(result.position);
                        that.peer.editor.current.rotation.copy(result.rotation);
                        that.peer.editor.signals.objectChanged.dispatch(that.peer.editor.current);

                    } else {

                        camerasId[result.uuid] = result;

                        result.near = 0.01;
                        result.far = 1;
                        result.aspect = 4 / 3;
                        result.updateProjectionMatrix();
                        that.peer.editor.addObject(result);

                    }*/
                }

                break;

            case 'objectChanged':
                that.peer.editor.getByUuid(result.uuid);
                var current = that.peer.editor.current;
                current.position.copy(result.position);
                current.scale.copy(result.scale);
                current.rotation.copy(result.rotation);
                that.peer.editor.signals.objectChanged.dispatch(current);
                break;
        }

    });

    this.peers[peerId].on('close', function (err) {
        console.log(peerId + ' has left.');

        that.peer.editor.removeObject(camerasId[peerId]);
        delete that.peers[peerId];
    });

    this.peers[peerId].on('error', function (err) {
        alert(err);
    });
};

User.prototype.sendDataOnEachConnexion = function (data) {
    for (var peerId in this.peers) {
        var connexion = this.peers[peerId];
        connexion.send(data);
    }
};

User.prototype.addSendToSignal = function () {
    var that = this;


    var xhr = new XHR(XHR.createXMLHttpRequest());

    var saveSceneDataOnServer = function (xhr,object) {
        xhr.post("/save", true);
        xhr.addSuccessCallBack(function () {
            console.log("bien ouej");
        });
        var value = {obj: object.toJSON()};
        xhr.send(JSON.stringify(value));
    };
    this.peer.editor.signalsP2P.objectAdded.add(function (object) {
        var data = {type: 'objectAdded', message: object.toJSON()};
        that.sendDataOnEachConnexion(data);
    });

    this.peer.editor.signalsP2P.dropEnded.add(function (object) {
        var data = {type: 'dropEnded', message: object.toJSON()};
        that.sendDataOnEachConnexion(data);
        that.saveSceneDataOnServer(xhr,object);
    });

    this.peer.editor.signalsP2P.cameraChanged.add(function (object) {
        var data = {type: 'cameraChanged', message: object.toJSON()};
        that.sendDataOnEachConnexion(data);
    });

    this.peer.editor.signalsP2P.objectRemoved.add(function (object) {
        var data = {type: 'objectRemoved', message: object.toJSON()};
        that.sendDataOnEachConnexion(data);
    });

    this.peer.editor.signalsP2P.objectSelected.add(function (object) {
        var data = {type: 'objectSelected', message: object === null ? null : object.toJSON()};
        that.sendDataOnEachConnexion(data);
    });

    this.peer.editor.signalsP2P.objectChanged.add(function (object, mouse) {
        var data = {type: 'objectChanged', message: object.toJSON(), mouse: mouse};
        that.sendDataOnEachConnexion(data);
    });

    this.peer.editor.signalsP2P.objectFocused.add(function (object) {
        var data = {type: 'objectFocused', message: object.toJSON()};
        that.sendDataOnEachConnexion(data);
    });


    /*signals.objectAdded.add(function(object){
     if (connexion){
     connexion.send({type:'objectAdded',message:object.toJSON()});
     }
     });
     signals.objectRemoved.add(function(object){
     if (connexion){
     connexion.send({type:'objectRemoved',message:object.toJSON()});
     }
     });
     signals.objectSelected.add(function(object){
     if (connexion){
     connexion.send({type:'objectSelected',message:object.toJSON()});
     }
     });

     signals.objectChanged.add(function(object){
     //conn.send("object added once");
     if (connexion){
     connexion.send({type:'objectChanged',message:object.toJSON()});
     }
     });*/

};

module.exports = User;