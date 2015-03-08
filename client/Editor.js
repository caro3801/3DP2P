/**
 * Created by caroline on 06/11/14.
 */
"use strict";

var THREE = require('three');
var signals = require('signals');
var Config = require ('./Config');
var Storage = require ('./Storage');
var Loader = require ('./Loader');


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

    this.camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100000 );
    this.scene = new THREE.Scene();
    this.scene.name = 'Scene';

    this.sceneHelpers = new THREE.Scene();

    this.object = {};
    this.geometries = {};
    this.materials = {};
    this.textures = {};

    this.selected = null;
    this.helpers = {};

};

Editor.prototype = {


    setScene: function ( scene ) {

        this.scene.name = scene.name;
        this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

        // avoid render per object

        this.signals.sceneGraphChanged.active = false;

        while ( scene.children.length > 0 ) {

            this.addObject( scene.children[ 0 ] );

        }

        this.signals.sceneGraphChanged.active = true;
        this.signals.sceneGraphChanged.dispatch();

    },

    //

    addObject: function ( object ) {

        var scope = this;

        object.traverse( function ( child ) {

            if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
            if ( child.material !== undefined ) scope.addMaterial( child.material );

            scope.addHelper( child );

        } );

        this.scene.add( object );
        this.signals.objectAdded.dispatch( object );
        this.signals.sceneGraphChanged.dispatch();

    },

    setObjectName: function ( object, name ) {

        object.name = name;
        this.signals.sceneGraphChanged.dispatch();

    },

    removeObject: function ( object ) {

        if ( object.parent === undefined ) return; // avoid deleting the camera or scene


        var scope = this;

        object.traverse( function ( child ) {

            scope.removeHelper( child );

        } );

        object.parent.remove( object );

        this.signals.objectRemoved.dispatch( object );
        this.signals.sceneGraphChanged.dispatch();

    },
    addGeometry: function ( geometry ) {

        this.geometries[ geometry.uuid ] = geometry;

    },

    setGeometryName: function ( geometry, name ) {

        geometry.name = name;
        this.signals.sceneGraphChanged.dispatch();

    },

    addMaterial: function ( material ) {

        this.materials[ material.uuid ] = material;

    },

    setMaterialName: function ( material, name ) {

        material.name = name;
        this.signals.sceneGraphChanged.dispatch();

    },

    addTexture: function ( texture ) {

        this.textures[ texture.uuid ] = texture;

    },

    //

    addHelper: function () {

        var geometry = new THREE.SphereGeometry( 20, 4, 2 );
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

        return function ( object ) {

            var helper;

            if ( object instanceof THREE.Camera ) {

                helper = new THREE.CameraHelper( object );

            } else if ( object instanceof THREE.PointLight ) {

                helper = new THREE.PointLightHelper( object, 10 );

            } else if ( object instanceof THREE.DirectionalLight ) {

                helper = new THREE.DirectionalLightHelper( object, 20 );

            } else if ( object instanceof THREE.SpotLight ) {

                helper = new THREE.SpotLightHelper( object, 10 );

            } else if ( object instanceof THREE.HemisphereLight ) {

                helper = new THREE.HemisphereLightHelper( object, 10 );

            } else if ( object instanceof THREE.SkinnedMesh ) {

                helper = new THREE.SkeletonHelper( object );

            } else {

                // no helper for this object type
                return;

            }

            var picker = new THREE.Mesh( geometry, material );
            picker.name = 'picker';
            picker.userData.object = object;
            picker.visible = false;
            helper.add( picker );

            this.sceneHelpers.add( helper );
            this.helpers[ object.id ] = helper;

            this.signals.helperAdded.dispatch( helper );

        };

    }(),


    removeHelper: function ( object ) {

        if ( this.helpers[ object.id ] !== undefined ) {

            var helper = this.helpers[ object.id ];
            helper.parent.remove( helper );

            delete this.helpers[ object.id ];

            this.signals.helperRemoved.dispatch( helper );

        }

    },

    //

    parent: function ( object, parent ) {

        if ( parent === undefined ) {

            parent = this.scene;

        }

        parent.add( object );

        this.signals.sceneGraphChanged.dispatch();

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

        if ( this.selected === object ) return;

        var uuid = null;

        if ( object !== null ) {

            uuid = object.uuid;

        }

        this.selected = object;

        this.config.setKey( 'selected', uuid );
        this.signals.objectSelected.dispatch( object );

    },
    lock: function ( object ) {

        if (object.locked ) return;

        object.locked = true;

        this.signals.objectLocked.dispatch( object );

    },

    unlock: function (object) {

        if ( !object.locked ) return;

        object.locked = false;

        this.signals.objectUnlocked.dispatch( object );

    },

    selectById: function ( id ) {

        this.select( this.scene.getObjectById( id, true ) );

    },
    getHelperByUuid: function ( uuid ) {

        var scope = this;

        this.sceneHelpers.traverse( function ( child ) {

            if ( child.uuid === uuid ) {

                scope.get(child) ;
            }else if (child.camera && child.camera.uuid === uuid){
                scope.get(child) ;
            }

        } );

    },
    getByUuid: function ( uuid ) {

        var scope = this;

        this.scene.traverse( function ( child ) {

            if ( child.uuid === uuid ) {

                scope.get(child) ;
            }

        } );

    },

    selectByUuid: function ( uuid ) {

        var scope = this;

        this.scene.traverse( function ( child ) {

            if ( child.uuid === uuid ) {

                scope.select( child );
            }

        } );

    },

    deselect: function () {

        this.select( null );

    },
    focus: function ( object ) {

        this.signals.objectFocused.dispatch( object );

    },

    focusById: function ( id ) {

        this.focus( this.scene.getObjectById( id, true ) );

    }

};

module.exports = Editor;