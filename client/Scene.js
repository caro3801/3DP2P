"use strict";

var THREE=require ('three');
var Trackball = require('three.trackball');
var clock = new THREE.Clock();


var range = 50;
var controls,stats;
var cubes,geom;
var renderer,scene,camera;
var mouseVector,projector,offset;
var width, height,container;
var SELECTED,INTERSECTED, plane;


function Scene(containerElem){
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';


    container = containerElem ;
    container.appendChild( stats.domElement );
    width =container.offsetWidth;
    height =container.offsetHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45,width / height, 1, 100000 );
    camera.position.set( 0, 0, range * 2 );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( width, height );

    container.appendChild( renderer.domElement );

    projector = new THREE.Projector();
    mouseVector = new THREE.Vector3();
    offset = new THREE.Vector3();
}
Scene.prototype.init = function init(){


    controls = new Trackball( camera, container );
    controls.addEventListener( 'change', render );

    plane = new THREE.Mesh(
        new THREE.PlaneGeometry( 2000, 2000, 8, 8 ),
        new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.25, transparent: true } )
    );
    plane.visible = false;
    scene.add( plane );

    var axes = buildAxes();
    scene.add(axes);


    bindEvents();


    window.addEventListener( 'resize', onWindowResize, false );

};


function bindEvents(){
    renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
    renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );

}


Scene.prototype.addObjectsToScene = function addObjectsToScene(){
    geom = new THREE.BoxGeometry( 5, 5, 5 );

    cubes = new THREE.Object3D();
    scene.add( cubes );

    for(var i = 0; i < 1; i++ ) {
        this.addCube();
    }
};

Scene.prototype.addCube = function addCube(){
    var grayness = Math.random() * 0.5 + 0.25,
        mat = new THREE.MeshBasicMaterial(),
        cube = new THREE.Mesh( geom, mat );
    mat.color.setRGB( grayness, grayness, grayness );
    cube.position.set(0, 0, 0 );
    //cube.position.set( range * (0.5 - Math.random()), range * (0.5 - Math.random()), range * (0.5 - Math.random()) );
    //cube.rotation.set( Math.random(), Math.random(), Math.random() );
    cube.grayness = grayness; // *** NOTE THIS
    cubes.add( cube );
};



function buildAxis( src, dst, colorHex, dashed ) {
    var geom = new THREE.Geometry(),
        mat;

    if(dashed) {
        mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 5, gapSize: 5 });
    } else {
        mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
    }

    geom.vertices.push( src.clone() );
    geom.vertices.push( dst.clone() );

    var axis = new THREE.Line( geom, mat );

    return axis;

}

function buildAxes() {
    var axes = new THREE.Object3D();

    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 100, 0, 0 ), 0xFF0000, false ) ); // +X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -100, 0, 0 ), 0x800000, true) ); // -X
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 100, 0 ), 0x00FF00, false ) ); // +Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -100, 0 ), 0x008000, true ) ); // -Y
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 100 ), 0x0000FF, false ) ); // +Z
    axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -100 ), 0x000080, true ) ); // -Z

    return axes;

}

Scene.prototype.animate = function animate(){
    controls.update(clock.getDelta());
    requestAnimationFrame( animate );
    render();

    stats.update();

};


function render(){
    renderer.render(scene,camera);
}


/* EVENTS */
function onWindowResize() {

    camera.aspect =width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

}


/*DEPLACEMENTS*/

function onMouseDown(event) {
    event.preventDefault();
    mouseVector.x = 2 * (event.clientX / width) - 1;
    mouseVector.y = 1 - 2 * (event.clientY / height );
    var raycaster = projector.pickingRay(mouseVector.clone(), camera);
    var intersects = raycaster.intersectObjects(cubes.children);
    if (intersects.length > 0) {
        controls.enabled = false;
        if (event.button == 0) { //left click

            SELECTED = intersects[ 0 ].object;

            var intersects = raycaster.intersectObject(plane);
            offset.copy(intersects[ 0 ].point).sub(plane.position);

            container.style.cursor = 'move';


        } else if (event.button == 2) {//right click
            if(conn){
                conn.send(
                    JSON.stringify({"action":"removeCube","id":intersects[ 0 ].object.id})
                );
            }
            removeCube(intersects[ 0 ].object);

            //render();
        }
    }
}


function onMouseMove(e){
    mouseVector.x = 2 * (e.clientX / width) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / height );
    var raycaster = projector.pickingRay( mouseVector.clone(), camera );

    cubes.children.forEach(function( cube ) {
        cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
    });

    if ( SELECTED ) {

        var intersects = raycaster.intersectObject( plane );
        SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
        return;

    }


    var   intersects = raycaster.intersectObjects( cubes.children );

    if ( intersects.length > 0 ) {

        if ( INTERSECTED != intersects[ 0 ].object ) {

            if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

            plane.position.copy( INTERSECTED.position );
            plane.lookAt( camera.position );

        }

        container.style.cursor = 'pointer';

    } else {

        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;

        container.style.cursor = 'auto';

    }

}


function onMouseUp(event){
    event.preventDefault();

    controls.enabled = true;

    if ( INTERSECTED ) {

        plane.position.copy( INTERSECTED.position );

        SELECTED = null;

    }

    container.style.cursor = 'auto';

}


module.exports = Scene;