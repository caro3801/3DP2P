/**
 * @author mrdoob / http://mrdoob.com/
 * @author zz85 / http://joshuakoo.com/
 */

var THREE=require('three');
module.exports = THREE.SVGLoader ;
THREE.SVGLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.SVGLoader.prototype = {

	constructor: THREE.MaterialLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var parser = new DOMParser();

		var loader = new THREE.XHRLoader();
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( svgString ) {

			var doc = parser.parseFromString( svgString, 'image/svg+xml' );  // application/xml

			onLoad( doc.firstChild );

		}, onProgress, onError );

	}
};
