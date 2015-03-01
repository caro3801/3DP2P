/**
 * Created by caroline on 03/11/14.
 */
"use strict";
var THREE = require('three');
var Peer = require("peerjs");
var XHR = require("./XHR");
var signals = require('signals');
var conn;
var camerasId = {};
var eventMove = new Event('mousemove');
function User(editor, viewport, toolbar) {
    this.peer = new Peer(window.location.hash.substring(1),{host: window.location.hostname, port: 9000, path: '/myapp'});
    this.peer.editor = editor;
    this.peer.viewport = viewport;
    this.peer.toolbar = toolbar;
    this.peer.on('open', function (id) {

        document.querySelector('#pid').value = id;
        console.log("open peer " + id);
        var partner = "hello";
        if (id == partner){
            partner = "test";
        }

        var elem=document.querySelector('#pid2');
        elem.value = partner;



    });
    this.peer.on("connection", this.connect);

    var oCamera = this.peer.editor.camera.clone();
    var oldPos;
    //var currCam=oCamera.clone();

    var curr=0;
    var i=0;
    this.peer.viewport.signals.cameraSwitched.add(function(currCam){

        var size=Object.keys(camerasId).length;
        if (i<size){
            oCamera.position.copy(currCam.position);
            oCamera.rotation.copy(currCam.rotation);
            var tmp=camerasId[Object.keys(camerasId)[i]];
            currCam.position.copy(tmp.position);
            currCam.rotation.copy(tmp.rotation);
            i++;
        }else if (i==size){

            currCam.position.copy(oCamera.position);
            currCam.rotation.copy(oCamera.rotation);
            i=0;
        }
        /*
        var currCam;
        for(var i=curr;i<=size;i++){
            if (i==size){
                camera=oCamera.clone();
                curr=0;
                break;
            }else{
                currCam=camerasId[Object.keys(camerasId)[i]];
                camera=currCam.clone();
                curr++;
                break;
            }
        }
*/
        //editor.signals.cameraChanged.dispatch( camera );
        editor.signals.cameraChanged.dispatch(oCamera);




    });

    /*this.sendingQueue={
     queue:new Array(),
     start:function () {
     setInterval(this.run.bind(this), 50); //adjust the interval
     },

     add:function (message) {
     this.queue.push(message);
     },


     run:function () {
     if (this.queue.length > 0) {
     var item = this.queue.shift();
     //item.conn that wrap RTCDataChannel
     //item.msg is the aCTUAL MESSAGE
     //This line will finally call RTCDataChannel.send
     item.conn.send(item.msg);
     }
     }
     }*/

}

User.prototype.connect = function (c) {
    conn = c;
    var that = this;
    conn.on('data', function (data) {

        var result = null;
        if (data.message != null){

            var loader = new THREE.ObjectLoader();
            result = loader.parse(data.message);
        }

        if (data.type == 'objectAdded') {
            that.editor.addObject(result);
        }
        else if (data.type =='dropEnded'){
            that.editor.addObject(result);
        }
        else if (data.type =='objectSelected'){

            if (result != null){
                that.editor.selectByUuid(result.uuid);
            }else{
                that.editor.deselect();
            }

        }
        else if (data.type =='objectFocused'){

            that.editor.focus(result);

        }
        else if (data.type =='objectRemoved'){


            that.editor.selectByUuid(result.uuid);

            var object = that.editor.selected;

            var parent = object.parent;

            that.editor.removeObject(object);

            that.editor.select(parent);


        }
        else if (data.type == 'cameraChanged'){

            if(result instanceof THREE.Camera) {
                var cam= camerasId[result.uuid];

                if (cam){
                    that.editor.getByUuid(result.uuid);
                    that.editor.current.position.copy(result.position);
                    that.editor.current.rotation.copy(result.rotation);
                    that.editor.signals.objectChanged.dispatch(that.editor.current);


                }else{

                    camerasId[result.uuid] = result;

                    result.near = 0.01;
                    result.far = 1;
                    result.aspect=4/3;
                    result.updateProjectionMatrix();
                    that.editor.addObject(result);
                }

            }

        }

        else if (data.type =='objectChanged'){

            that.editor.getByUuid(result.uuid);
            var current = that.editor.current;
            current.position.copy(result.position);
            current.scale.copy(result.scale);
            current.rotation.copy(result.rotation);
            that.editor.signals.objectChanged.dispatch(current);

        }

    });

    conn.on('close', function (err) {
        console.log(conn.peer + ' has left.')
    });
};


User.prototype.connectToPeer = function (id) {
    var c = this.peer.connect(id);

    var that = this;
    c.on('open', function () {

        that.connect(c);
        console.log("open connection with " + conn.peer);

        that.addSendToSignal(conn);
    });
    c.on('error', function (err) {
        alert(err)
    });


};


User.prototype.addSendToSignal = function (connexion) {
    var signals = this.peer.editor.signalsP2P;
    var that = this;

    var xhr= new XHR(XHR.createXMLHttpRequest());
    xhr.post("/save",true);
    xhr.addSuccessCallBack(function (){
        console.log("bien ouej");
    });
    this.peer.editor.signalsP2P.objectAdded.add(function (object) {
        if (connexion) {
            connexion.send({type: 'objectAdded', message: object.toJSON()});
        }


    });


    this.peer.editor.signalsP2P.dropEnded.add(function (object) {
        if (connexion) {
            connexion.send({type: 'dropEnded', message: object.toJSON()});
        }
        xhr.send(JSON.stringify(object.toJSON()));
    });

    this.peer.editor.signalsP2P.cameraChanged.add(function (object) {

        if (connexion) {
            connexion.send({type: 'cameraChanged', message: object.toJSON(), idCamera:connexion.id});
        }
    });
    this.peer.editor.signalsP2P.objectRemoved.add(function (object) {
        if (connexion) {
            connexion.send({type: 'objectRemoved', message: object.toJSON()});
        }
    });
    this.peer.editor.signalsP2P.objectSelected.add(function (object) {
        if (connexion) {

            if(object ==null){
                connexion.send({type: 'objectSelected', message: null});

            }else{
                connexion.send({type: 'objectSelected', message: object.toJSON()});

            }
        }
    });
    this.peer.editor.signalsP2P.objectChanged.add(function (object,mouse) {
        if (connexion) {
            connexion.send({type: 'objectChanged', message: object.toJSON(),mouse :mouse});
        }
    });
    this.peer.editor.signalsP2P.objectFocused.add(function(object){
        if (connexion){
            connexion.send({type:'objectFocused',message:object.toJSON()});
        }
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