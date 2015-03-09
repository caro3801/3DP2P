/**
 * Created by caroline on 03/11/14.
 */
"use strict";
var THREE = require('three');
var Peer = require("peerjs");
var sceneStore = require("./sceneStore");
var camerasId = {};
function User(editor, viewport, toolbar) {
    this.peers = {};
    this.peer = new Peer({host: window.location.hostname, port: 9000, path: '/myapp'});
    var peer = this.peer;
    var that = this;


    this.peer.on('open', function (peerId) {
        console.log("my name is : " + peerId);
        var myname = document.querySelector('#pid');
        myname.value = peerId;
        that.peer.on('connection', function (connp) {
            that.peers[connp.peer] = connp;
            that.listen(connp.peer);
            connp.on('open', function(){
                that.peer.editor.signalsP2P.cameraAdded.dispatch(that.peer.editor.camera);
            });
        });

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
			oCamera.lookAt(currCam.getWorldDirection());

            var tmp = camerasId[Object.keys(camerasId)[i]];
            currCam.position.copy(tmp.position);
            currCam.rotation.copy(tmp.rotation);

			currCam.lookAt(tmp.getWorldDirection());
            i++;
        } else if (i == size) {
            currCam.position.copy(oCamera.position);
            currCam.rotation.copy(oCamera.rotation);
			currCam.lookAt(oCamera.getWorldDirection());
            i = 0;
        }
        editor.signals.cameraChanged.dispatch(oCamera);
    });
}

User.prototype.connect = function (peerId) {
    var connect = this.peer.connect(peerId);
    this.peers[peerId] = connect;
    this.listen(peerId);
    var that = this;
    connect.on('open', function(){
        that.peer.editor.signalsP2P.cameraAdded.dispatch(that.peer.editor.camera);
    });

};

User.prototype.listen = function (peerId) {
    var that = this;
    this.addSendToSignal(this.peers[peerId]);

    this.peers[peerId].on('data', function (data) {
        //console.log(data);

        var result = null;
        var uuid = null;

        //if we don't have uuid we have full object
        if (data.message.uuid) {

            uuid = data.message.uuid;

            //transformations are defined for known uuid object
            if (data.message.transformations) {

                //Position
                var jP = JSON.parse(data.message.transformations.position);
                var vP = new THREE.Vector3(jP.x, jP.y, jP.z);
                //Rotation
                var rP = JSON.parse(data.message.transformations.rotation);
                var vR = new THREE.Euler(rP.x, rP.y, rP.z,rP.order);
                //Scale
				if(data.message.transformations.scale){

					var sP = JSON.parse(data.message.transformations.scale);
					var vS = new THREE.Vector3(sP.x, sP.y, sP.z);
				}

            }
			if (data.message.worldDirection){
				var wD = JSON.parse(data.message.worldDirection);
				var vWD = new THREE.Vector3(wD.x, wD.y, wD.z);
			}

        } else if (data.message.object) {

            var loader = new THREE.ObjectLoader();
            result = loader.parse(data.message.object);

        } else {

            throw new Error("Error in message : no object or uuid found");

        }

        switch (data.type) {
            case 'objectAdded':
                that.peer.editor.addObject(result);
                break;
            case 'dropEnded':
                that.peer.editor.addObject(result);
                break;
            case 'objectLocked':
                that.peer.editor.getByUuid(uuid);
                that.peer.editor.lock(that.peer.editor.current);
                break;
            case 'objectUnlocked':
                that.peer.editor.getByUuid(uuid);
                that.peer.editor.unlock(that.peer.editor.current);
                break;
            case 'objectFocused':
                that.peer.editor.getByUuid(uuid);
                that.peer.editor.focus(that.peer.editor.current);

                break;
            case 'objectRemoved':

                that.peer.editor.getByUuid(uuid);

                var object = that.peer.editor.current;

                var parent = object.parent;

                that.peer.editor.removeObject(object);

                that.peer.editor.get(parent);
                break;
            case 'cameraAdded':

                if (result instanceof THREE.Camera) {
                    if (!camerasId[this.peer]) {
                        camerasId[this.peer] = result;
                        result.near = 0.01;
                        result.far = 1;
                        result.aspect = 4 / 3;
                        result.updateProjectionMatrix();
                        that.peer.editor.addObject(result);
                    }
                }
                break;

            case 'cameraChanged':
                    if (camerasId[this.peer]) {
                        //update camera

                        that.peer.editor.getByUuid(uuid);

                        that.peer.editor.current.position.copy(vP);
                        that.peer.editor.current.rotation.fromArray(rP);
						//that.peer.editor.current.lookAt(wD);
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



                break;

            case 'objectChanged':
                //UUID
                that.peer.editor.getByUuid(uuid);

                var current = that.peer.editor.current;

                that.peer.editor.current.position.copy(vP);
                that.peer.editor.current.rotation.copy(vR);
                that.peer.editor.current.scale.copy(vS);

                that.peer.editor.signals.objectChanged.dispatch(current);
                break;
        }

    });

    this.peers[peerId].on('close', function (err) {
        console.log(peerId + ' has left.');

        that.peer.editor.removeObject(camerasId[peerId]);
        delete camerasId[peerId];
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
	var sceneId=1;

    this.peer.editor.signalsP2P.objectAdded.add(function (object) {
		var message = {
			"object": object.toJSON()
		};
        var data = {type: 'objectAdded', message: message};
        that.sendDataOnEachConnexion(data);
		sceneStore.sendToServer(sceneId,data);
    });

    this.peer.editor.signalsP2P.dropEnded.add(function (object) {
        var message = {
            "object": object.toJSON()
        };

        var data = {type: 'dropEnded', message: message};

        that.sendDataOnEachConnexion(data);
		sceneStore.sendToServer(sceneId,data);
    });

    this.peer.editor.signalsP2P.objectRemoved.add(function (object) {
        var message = {
            uuid: object.uuid
        };

        var data = {type: 'objectRemoved', message: message};
        that.sendDataOnEachConnexion(data);

		sceneStore.sendToServer(sceneId,data);
    });

	this.peer.editor.signalsP2P.objectChanged.add(function (object) {
		var message = {
			uuid: object.uuid,
			transformations: {
				position: JSON.stringify(object.position),
				rotation: JSON.stringify(object.rotation),
				scale: JSON.stringify(object.scale)
			}
		};
		var data = {type: 'objectChanged', message: message};
		var data2 = {type: 'objectChanged', message: {uuid:object.parent.uuid,object:object.parent.toJSON()}};
		that.sendDataOnEachConnexion(data);
		sceneStore.sendToServer(sceneId,data2);

	});

	this.peer.editor.signalsP2P.cameraAdded.add(function (object) {
		var message = {
			"object": object.toJSON()
		};
		var data = {type: 'cameraAdded', message: message};
		that.sendDataOnEachConnexion(data);
	});

	this.peer.editor.signalsP2P.cameraChanged.add(function (object) {
		var wdv = object.getWorldDirection();
		var message = {
			"object": object.toJSON(),
			uuid: object.uuid,
			transformations: {
				position:   JSON.stringify(object.position),
				rotation:   JSON.stringify(object.rotation.toArray())
			},
			worldDirection:JSON.stringify(wdv)
		};

		var data = {type: 'cameraChanged', message: message};
		that.sendDataOnEachConnexion(data);

	});

    this.peer.editor.signalsP2P.objectLocked.add(function (object) {
        var message = {
            uuid: object.uuid
        };
        var data = {type: 'objectLocked', message: message};
        that.sendDataOnEachConnexion(data);
    });

    this.peer.editor.signalsP2P.objectUnlocked.add(function (object) {
        var message = {
            uuid: object.uuid
        };
        var data = {type: 'objectUnlocked', message: message};
        that.sendDataOnEachConnexion(data);
    });

    this.peer.editor.signalsP2P.objectFocused.add(function (object) {
        var message = {
            uuid: object.uuid
        };
        var data = {type: 'objectFocused', message: message};
        that.sendDataOnEachConnexion(data);
    });

};

module.exports = User;