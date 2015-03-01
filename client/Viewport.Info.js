/**
 * @author mrdoob / http://mrdoob.com/
 */

var THREE = require  ('three');
var Viewport = require ('./Viewport');
Viewport.Info = function ( editor ) {

	var signals = editor.signals;


	signals.objectAdded.add( update );
	signals.objectRemoved.add( update );
	signals.geometryChanged.add( update );

	//
	 var container = document.createElement('div');
	function update() {

		var scene = editor.scene;

		var objects = 0, vertices = 0, triangles = 0;

		for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

			var object = scene.children[ i ];

			object.traverseVisible( function ( object ) {

				objects ++;

				if ( object instanceof THREE.Mesh ) {

					var geometry = object.geometry;

					if ( geometry instanceof THREE.Geometry ) {

						vertices += geometry.vertices.length;
						triangles += geometry.faces.length;

					} else if ( geometry instanceof THREE.BufferGeometry ) {

						vertices += geometry.attributes.position.array.length / 3;

						if ( geometry.attributes.index !== undefined ) {

							triangles += geometry.attributes.index.array.length / 3;

						} else {

							triangles += geometry.attributes.position.array.length / 9;

						}

					}

				}

			} );

		}

		document.querySelector('#viewport-info').innerHTML = "Viewport info : objects : "+objects+", vertices :"+ vertices+", triangles : "+triangles;


	}

	return container;

};
module.exports = Viewport.Info;