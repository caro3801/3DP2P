/**
 * Created by caroline on 06/11/14.
 */
"use strict";

var THREE = require('three');
var signals = require('signals');
var Config = require ('./Config');
var Storage = require ('./Storage');
var Loader = require ('./Loader');
var Viewport = require ('./Viewport');


var Editor = function () {
    var SIGNALS = signals;

    this.signals = {


        snapChanged: new SIGNALS.Signal(),
        spaceChanged: new SIGNALS.Signal(),
        rendererChanged: new SIGNALS.Signal(),
        savingStarted: new SIGNALS.Signal(),
        savingFinished: new SIGNALS.Signal(),

        sceneGraphChanged: new SIGNALS.Signal(),

        themeChanged: new SIGNALS.Signal(),
        transformModeChanged: new SIGNALS.Signal(),
        cameraChanged: new SIGNALS.Signal(),
        cameraSwitched: new SIGNALS.Signal(),

        geometryChanged: new SIGNALS.Signal(),

        objectSelected: new SIGNALS.Signal(),
        objectLocked: new SIGNALS.Signal(),
        objectUnlocked: new SIGNALS.Signal(),
        objectFocused: new SIGNALS.Signal(),

        objectAdded: new SIGNALS.Signal(),
        objectChanged: new SIGNALS.Signal(),
        objectRemoved: new SIGNALS.Signal(),

        helperAdded: new SIGNALS.Signal(),
        helperRemoved: new SIGNALS.Signal(),
        helperChanged: new SIGNALS.Signal(),

        materialChanged: new SIGNALS.Signal(),
        windowResize: new SIGNALS.Signal(),

        showGridChanged: new SIGNALS.Signal(),
        gridChanged: new SIGNALS.Signal()
    };
    this.signalsP2P = {
        snapChanged: new SIGNALS.Signal(),
        spaceChanged: new SIGNALS.Signal(),
        rendererChanged: new SIGNALS.Signal(),
        savingStarted: new SIGNALS.Signal(),
        savingFinished: new SIGNALS.Signal(),

        sceneGraphChanged: new SIGNALS.Signal(),

        themeChanged: new SIGNALS.Signal(),
        transformModeChanged: new SIGNALS.Signal(),
        cameraChanged: new SIGNALS.Signal(),
        cameraAdded: new SIGNALS.Signal(),

        geometryChanged: new SIGNALS.Signal(),

        objectSelected: new SIGNALS.Signal(),
        objectLocked: new SIGNALS.Signal(),
        objectUnlocked: new SIGNALS.Signal(),
        objectFocused: new SIGNALS.Signal(),

        objectAdded: new SIGNALS.Signal(),
        objectChanged: new SIGNALS.Signal(),
        objectRemoved: new SIGNALS.Signal(),

        helperAdded: new SIGNALS.Signal(),
        helperRemoved: new SIGNALS.Signal(),

        materialChanged: new SIGNALS.Signal(),
        windowResize: new SIGNALS.Signal(),

        showGridChanged: new SIGNALS.Signal(),
        gridChanged: new SIGNALS.Signal(),
//
        dropEnded : new SIGNALS.Signal()
    };

    this.config = new Config();
    this.storage = new Storage();
    this.loader = new Loader( this );

    this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    this.scene = new THREE.Scene();
    this.scene.name = 'Scene';

    this.sceneHelpers = new THREE.Scene();

    this.object = {};
    this.geometries = {};
    this.materials = {};
    this.textures = {};

    this.selected = null;
    this.helpers = {};

	this.viewport = new Viewport(this);
	var that = this;
	this.viewport.addClickEvent(function(object){
		that.select(object);
		that.viewport.render();
	})

};

Editor.prototype = {
    addObject: function ( object ) {
		this.viewport.addObject(object);
    },

    //
    get: function ( object ) {

        if ( this.current === object ) return;

        var uuid = null;

        if ( object !== null ) {

            uuid = object.uuid;

        }

        this.current = object;

        this.config.setKey( 'current', uuid );

    },
    select: function ( object ) {
		this.viewport.selectObject(object);
    },
    deselect: function () {

        this.select( null );

    }
};

module.exports = Editor;