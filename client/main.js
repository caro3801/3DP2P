"use strict";

var THREE = require('three');
var Editor = require("./Editor");
var Toolbar = require('./Toolbar');
var Viewport = require("./Viewport");
var User = require('./User');
var sceneStore  = require('./sceneStore');
document.addEventListener("DOMContentLoaded",function(event) {
    var editor = new Editor();
	editor.sceneId = null;
	var hash=window.location.pathname.split("/");
	for (var i=0;i<hash.length;++i){
		if (hash[i].toLowerCase()==="scenes"){
			editor.sceneId=hash[++i];
			break;
		}
	}
	var sceneId=editor.sceneId;
    var viewport = new Viewport(editor);
    var toolbar = new Toolbar(editor);
    var user = new User(editor,viewport,toolbar);
	document.querySelector("#left").appendChild(toolbar);
	document.querySelector("#editor").appendChild(viewport.container);

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
		var signalsP2P = editor.signalsP2P;
       /* signals.geometryChanged.add(saveState);
        signals.objectAdded.add(saveState);
        signals.objectChanged.add(saveState);
        signals.objectRemoved.add(saveState);
        signals.materialChanged.add(saveState);
        signals.sceneGraphChanged.add(saveState);
*/
		 //signals.geometryChanged.add(saveState);
		 signalsP2P.dropEnded.add(function(o){
			 sceneStore.sendToServer(sceneId,{type:'objectAdded',message: {object:o.toJSON()}});
		 });
		 signalsP2P.objectChanged.add(function(object){

			 sceneStore.sendToServer(sceneId,{type:'objectChanged',  message: {uuid:object.parent.uuid,object:object.parent.toJSON()}});
		 });
		 signals.objectRemoved.add(function(o){
			 sceneStore.sendToServer(sceneId,{type:'objectRemoved', message:{uuid:o.uuid}});
		 });
		 //signals.materialChanged.add(saveState);


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
                        editor.removeObject(parent);
                        editor.signalsP2P.objectRemoved.dispatch(parent);
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

		var initData = function(){

			if(sceneId!==null){
				sceneStore.getObjects(sceneId,function(results){
					var allData = JSON.parse(results);

					for (var i=0;i<allData.length;i++){
						var object = allData[i].object;
						if ( object.metadata && object.metadata.type.toLowerCase() === 'object' ) {

							var loader = new THREE.ObjectLoader();
							var result = loader.parse(object);
							if (result instanceof THREE.Scene) {

								editor.setScene(result);

							} else {

								editor.addObject(result);
								editor.select(result);

							}
						}
					}
				});
			}else{
				throw new Error('Scene id is not matching existing ones...');
			}

		}
		initData();

    });

	var browser=document.createElement("div");
	browser.id="browser";
	browser.innerHTML=navigator.userAgent;
	document.querySelector("#content").appendChild(browser);
/*
	var sceneId =document.getElementById("sceneId");
	sceneId.addEventListener('keydown', function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			var sceneId = event.target.value;
			sceneStore.get(sceneId,function(results){
				var allData = JSON.parse(results);

				for (var i=0;i<allData.length;i++){
					var data = allData[i].object;
					if ( data.metadata.type.toLowerCase() === 'object' ) {

						var loader = new THREE.ObjectLoader();
						var result = loader.parse( data );

						if ( result instanceof THREE.Scene ) {

							editor.setScene( result );

						} else {

							editor.addObject( result );
							editor.select( result );

						}

					}
				}
			});
		}
	})*/


});
module.exports;