/**
 * @author mrdoob / http://mrdoob.com/
 */
var THREE  =require('three');
require ('../renderers/RaytracingRenderer');
var EditorControls = require ('../controls/EditorControls');
require ('../controls/TransformControls');
var Viewport = function ( editor ) {

	var signals = editor.signals;
	var signalsP2P = editor.signalsP2P;

	var container = document.createElement('div');
	container.id='viewport';
	container.style.position = 'absolute' ;

	container.appendChild( new Viewport.Info( editor ) );

	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;

	var objects = [];
	var i=0;

	// helpers
	var size =500, step=25;
	var grid = new THREE.GridHelper( size, step );
	grid.size = size;
	grid.step = step;
	sceneHelpers.add( grid );

	//

	var camera = editor.camera;
	camera.position.fromArray( editor.config.getKey( 'camera/position' ) );
	camera.lookAt( new THREE.Vector3().fromArray( editor.config.getKey( 'camera/target' ) ) );

	//

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var transformControls = new THREE.TransformControls( camera, container );
	transformControls.addEventListener( 'change', function () {

		var object = transformControls.object;
		if ( object !== undefined ) {

			if ( editor.helpers[ object.id ] !== undefined ) {

				editor.helpers[ object.id ].update();

			}
		}

		render();

	} );


	transformControls.addEventListener( 'mouseDown', function () {

		controls.enabled = false;

	} );
	transformControls.addEventListener( 'mouseUp', function () {
		signals.objectChanged.dispatch( transformControls.object );
		editor.signalsP2P.objectChanged.dispatch( editor.selected  );
		controls.enabled = true;

	} );

	sceneHelpers.add( transformControls );
// object picking

	var raycaster = new THREE.Raycaster();

	// events

	var getIntersects = function ( point, object ) {

		var vector = new THREE.Vector3();
		vector.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1, 0.5 );
		vector.unproject( camera );

		raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

		if ( object instanceof Array ) {

			return raycaster.intersectObjects( object );

		}

		return raycaster.intersectObject( object );

	};

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	var getMousePosition = function ( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	};
	var handleClick = function () {

		if ( onDownPosition.distanceTo( onUpPosition ) == 0 ) {

			var intersects = getIntersects( onUpPosition, objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {

					// helper

					editor.select( object.userData.object );

					editor.signalsP2P.objectSelected.dispatch(object.userData.object);

				} else {

					editor.select( object );
					editor.signalsP2P.objectSelected.dispatch(object);

				}

			} else {

				editor.select( null );

				editor.signalsP2P.objectSelected.dispatch(null);


			}

			render();

		}

	};

	var onMouseDown = function ( event ) {

		event.preventDefault();

		var array = getMousePosition( container, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseUp = function ( event ) {

		var array = getMousePosition( container, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	};

	var onTouchStart = function ( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	};

	var onTouchEnd = function ( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	};

	var onDoubleClick = function ( event ) {

		var array = getMousePosition( container, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

			signals.objectFocused.dispatch( intersect.object );
			signalsP2P.objectFocused.dispatch( intersect.object );

		}

	};

	container.addEventListener( 'mousedown', onMouseDown, false );
	container.addEventListener( 'touchstart', onTouchStart, false );
	container.addEventListener( 'dblclick', onDoubleClick, false );

        // controls need to be added *after* main logic,
        // otherwise controls.enabled doesn't work.

	var controls = new EditorControls( camera, container );
	controls.center.fromArray( editor.config.getKey( 'camera/target' ) );
	controls.addEventListener( 'change', function () {

		transformControls.update();
		signals.cameraChanged.dispatch( camera );
		signalsP2P.cameraChanged.dispatch( camera );

	} );


	// signals

	signals.themeChanged.add( function ( value ) {
		grid.setColors( 0x444444, 0x888888 );
		clearColor = 0xaaaaaa;


		renderer.setClearColor( clearColor );

		render();

	} );

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );

	signals.rendererChanged.add( function ( type, antialias ) {

		container.removeChild( rendererElement );

		renderer = createRenderer( type, antialias );
		renderer.setClearColor( clearColor );
		renderer.setSize( container.offsetWidth, container.offsetHeight );

		container.appendChild( renderer.domElement );

		render();

	} );

	signals.sceneGraphChanged.add( function () {

		render();

	} );

	var saveTimeout;

	signals.cameraChanged.add( function () {

		if ( saveTimeout !== undefined ) {

			clearTimeout( saveTimeout );

		}

		saveTimeout = setTimeout( function () {

			editor.config.setKey(
				'camera/position', camera.position.toArray(),
				'camera/target', controls.center.toArray()
			);

		}, 1000 );

		render();

	} );


	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null ) {

			if ( object.geometry !== undefined &&
				 object instanceof THREE.Sprite === false ) {

				selectionBox.update( object );
				selectionBox.visible = true;

			}

			if ( object instanceof THREE.PerspectiveCamera === false ) {

				transformControls.attach( object );

			}

		}

		render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( render );

	signals.objectAdded.add( function ( object ) {

		var materialsNeedUpdate = false;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

			objects.push( child );

		} );

		if ( materialsNeedUpdate === true ) updateMaterials();

	} );

	signals.objectChanged.add( function ( object ) {

		transformControls.update();

		if ( object !== camera ) {

			if ( object.geometry !== undefined ) {

				selectionBox.update( object );

			}

			if ( editor.helpers[ object.id ] !== undefined ) {

				editor.helpers[ object.id ].update();

			}

		}

		render();

	} );




	signals.objectRemoved.add( function ( object ) {

		var materialsNeedUpdate = false;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

			objects.splice( objects.indexOf( child ), 1 );

		} );

		if ( materialsNeedUpdate === true ) updateMaterials();

	} );

	signals.helperAdded.add( function ( object ) {

		objects.push( object.getObjectByName( 'picker' ) );

	} );
	signals.helperChanged.add( function ( id ) {
		if ( editor.helpers[ id ] !== undefined ) {

			editor.helpers[ id ].update();

		}
		render();

	} );

	signals.helperRemoved.add( function ( object ) {

		objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

	} );

	signals.materialChanged.add( function ( material ) {

		render();

	} );



	signals.windowResize.add( function () {

		camera.aspect = container.offsetWidth / container.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.offsetWidth, container.offsetHeight );

		render();

	} );
	signals.gridChanged.add( function ( step,size ) {

		size = size || 500;
		step = step || 25;

		sceneHelpers.remove( grid );
		grid = new THREE.GridHelper(size,step);
		sceneHelpers.add( grid );
	} );
	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		render();

	} );



	//

	var createRenderer = function ( type, antialias ) {

		var supportsWebGL = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

		if ( type === 'WebGLRenderer' && supportsWebGL === false ) {

			type = 'CanvasRenderer';

		}

		var renderer = new THREE[ type ]( { antialias: antialias } );
		renderer.autoClear = false;
		renderer.autoUpdateScene = false;

		return renderer;

	};

	var clearColor;
	var renderer = createRenderer( editor.config.getKey( 'renderer' ), editor.config.getKey( 'renderer/antialias' ) );
	container.appendChild( renderer.domElement );

	animate();

	//

	function updateMaterials() {

		editor.scene.traverse( function ( node ) {

			if ( node.material ) {

				node.material.needsUpdate = true;

				if ( node.material instanceof THREE.MeshFaceMaterial ) {

					for ( var i = 0; i < node.material.materials.length; i ++ ) {

						node.material.materials[ i ].needsUpdate = true;

					}

				}

			}

		} );

	}


	function animate() {

		requestAnimationFrame( animate );

		// animations

		if ( THREE.AnimationHandler.animations.length > 0 ) {

			THREE.AnimationHandler.update( 0.016 );

			for ( var i = 0, l = sceneHelpers.children.length; i < l; i ++ ) {

				var helper = sceneHelpers.children[ i ];

				if ( helper instanceof THREE.SkeletonHelper ) {

					helper.update();

				}

			}

			render();

		}

	}

	function render() {

		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		renderer.clear();
		renderer.render( scene, camera );

		if ( renderer instanceof THREE.RaytracingRenderer === false ) {

			renderer.render( sceneHelpers, camera );

		}

	}

	return {container:container,transformControls:transformControls, signals : signals, controls:controls};

};
module.exports = Viewport;
