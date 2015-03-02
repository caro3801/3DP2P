"use strict";

var THREE = require('three');
var Editor = require("./Editor");
var Toolbar = require('./Toolbar');
var Viewport = require("./Viewport");
var User = require('./User');
document.addEventListener("DOMContentLoaded",function(event) {
    var editor = new Editor();
    var viewport = new Viewport(editor);
    var toolbar = new Toolbar(editor);
    var user = new User(editor,viewport,toolbar);

    document.body.appendChild(toolbar);
    document.body.appendChild(viewport.container);

    editor.storage.init(function () {
        editor.storage.get(function (state) {
            if (state !== undefined) {
                var loader = new THREE.ObjectLoader();
                var scene = loader.parse(state);
                editor.setScene(scene);
            }
            var selected = editor.config.getKey('selected');
            if (selected !== undefined) {
                editor.selectByUuid(selected);
            }
        });
        //
        var timeout;


        var saveState = function (scene) {

            if (editor.config.getKey('autosave') === false) {
                return;
            }
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                editor.signals.savingStarted.dispatch();
                timeout = setTimeout(function () {
                    editor.storage.set(editor.scene.toJSON());
                    editor.signals.savingFinished.dispatch();
                }, 100);
            }, 1000);
        };

        var signals = editor.signals;
        signals.geometryChanged.add(saveState);
        signals.objectAdded.add(saveState);
        signals.objectChanged.add(saveState);
        signals.objectRemoved.add(saveState);
        signals.materialChanged.add(saveState);
        signals.sceneGraphChanged.add(saveState);

        editor.signals.themeChanged.dispatch();

        document.addEventListener('dragover', function (event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }, false);

        document.addEventListener('drop', function (event) {
            event.preventDefault();
            editor.loader.loadFile(event.dataTransfer.files[0]);

        }, false);

        document.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case 8: // prevent browser back
                    event.preventDefault();
                    break;
                case 46: // delete
                    var parent = editor.selected.parent;
                    if ( confirm( 'Delete ' + editor.selected.name + '?' ) === true ){
                        editor.removeObject(editor.selected);
                        editor.signalsP2P.objectRemoved.dispatch(editor.selected);
                        editor.select(parent);
                    }
                    break;

                case 83: //s for Switching camera
                    user.peer.editor.signals.cameraSwitched.dispatch(editor.camera);
                break;
            }
        }, false);

        var onWindowResize = function (event) {
            editor.signals.windowResize.dispatch();
        };
        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();

    });

    document.querySelector("#browser").innerHTML=navigator.userAgent;
    var elem=document.querySelector('#pid2');

    elem.addEventListener('keydown',function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            user.connect(event.target.value);
        }
    },true);


});
module.exports;