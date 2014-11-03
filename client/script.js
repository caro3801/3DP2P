"use strict";
var Peer = require ("peerjs");
var peer = new Peer({host: window.location.hostname, port: 9000, path: '/myapp'});
var userList = [];

peer.listAllPeers(function(list){
    for(var cnt = 0;cnt < list.length;cnt++){
        userList.push(list[cnt]);
    }
    console.log(userList);
});

var conn;
peer.on('open', function(id){

    document.querySelector('#pid').value=id;


});
peer.on("connection",connect);
function connect(c){
    conn = c;
    conn.on('data', function(data) {
        // Append the data to body.
        console.log(data);
        var json=JSON.parse(data);
        test(json);
        document.querySelector('#helloworld').appendChild(document.createTextNode(data));
    });

    conn.on('close', function(err){ alert(conn.peer + ' has left the chat.') });
}
function test(data){
    switch (true) {
        case /addCube/.test(data.action):
            addCube();
            break;
        case /removeCube/.test(data.action):
            removeCube(cubes.getObjectById(data.id));
            break;
        case /moveCube/.test(data.action):
            moveCube(cubes.getObjectById(data.id), data.dest);
        default:
            console.log("• Didn't match any test");
            break;
    }
    render();
}
var THREE=require ('three');
var Trackball = require('three.trackball');
var clock = new THREE.Clock();
var scene, camera,controls, renderer;
var geom , cubes, axes;

var projector, mouseVector, offset;

var range = 50;
var mesh;

var elem,widthC,heightC,stats ;

var SELECTED,INTERSECTED, plane;


document.addEventListener("DOMContentLoaded",function(event){


    document.querySelector("#addCube").addEventListener("click",function(){
        addCube();
        if(conn){
            conn.send(
                JSON.stringify({"action":"addCube"})
            );
        }
        render();
    },false);
    document.querySelector("#importScene").addEventListener("click",function(){importScene();render();},false);
    document.querySelector("#exportScene").addEventListener("click",function(){exportScene();},false);
    document.querySelector("#connect").addEventListener("click",connectToPeer,false);
    document.querySelector("#sendButton").addEventListener("click", sendHello,false);
    elem   = document.querySelector("#container");
    widthC  = elem.offsetWidth;
    heightC = elem.offsetHeight;
    init();
    animate();
});

function init(){

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45,widthC /heightC, 1, 100000 );
    camera.position.set( 0, 0, range * 2 );
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    controls = new Trackball( camera,elem );
    controls.addEventListener( 'change', render );


    geom = new THREE.BoxGeometry( 5, 5, 5 );

    cubes = new THREE.Object3D();
    scene.add( cubes );

    for(var i = 0; i < 1; i++ ) {
        addCube();
    }

    plane = new THREE.Mesh(
        new THREE.PlaneGeometry( 2000, 2000, 8, 8 ),
        new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.25, transparent: true } )
    );
    plane.visible = false;
    scene.add( plane );

    axes = buildAxes();
    scene.add(axes);

   // scene.add(mesh);
    projector = new THREE.Projector();
    mouseVector = new THREE.Vector3();
    offset = new THREE.Vector3();


    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( widthC, heightC );
    elem.appendChild( renderer.domElement );
    renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
    renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );
    window.addEventListener( 'resize', onWindowResize, false );

}
function addCube(){
    var grayness = Math.random() * 0.5 + 0.25,
        mat = new THREE.MeshBasicMaterial(),
        cube = new THREE.Mesh( geom, mat );
    mat.color.setRGB( grayness, grayness, grayness );
    cube.position.set(0, 0, 0 );
    //cube.position.set( range * (0.5 - Math.random()), range * (0.5 - Math.random()), range * (0.5 - Math.random()) );
    //cube.rotation.set( Math.random(), Math.random(), Math.random() );
    cube.grayness = grayness; // *** NOTE THIS
    cubes.add( cube );
}


function onMouseMove(e){
    mouseVector.x = 2 * (e.clientX / widthC) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / heightC );
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


function onMouseDown(event) {
    event.preventDefault();
    mouseVector.x = 2 * (event.clientX / widthC) - 1;
    mouseVector.y = 1 - 2 * (event.clientY / heightC );
    var raycaster = projector.pickingRay(mouseVector.clone(), camera);
    var intersects = raycaster.intersectObjects(cubes.children);
    if (intersects.length > 0) {
        controls.enabled = false;
        if (event.button == 0) { //left click

            SELECTED = intersects[ 0 ].object;

            var intersects = raycaster.intersectObject(plane);
            offset.copy(intersects[ 0 ].point).sub(plane.position);

            elem.style.cursor = 'move';


        } else if (event.button == 2) {//right click
            if(conn){
                conn.send(
                    JSON.stringify({"action":"removeCube","id":intersects[ 0 ].object.id})
                );
            }
            removeCube(intersects[ 0 ].object);

            render();
        }
    }
}


function removeCube(object){
    cubes.remove(object);
}


function onMouseUp(event){
    event.preventDefault();

    controls.enabled = true;

    if ( INTERSECTED ) {

        plane.position.copy( INTERSECTED.position );

        SELECTED = null;

    }

    elem.style.cursor = 'auto';

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

function onWindowResize() {
    widthC= elem.offsetWidth;
    heightC = elem.offsetHeight;
    camera.aspect =widthC /heightC;
    camera.updateProjectionMatrix();
    renderer.setSize(widthC, heightC);

}

function importScene(){

}
function exportScene(){

}

function animate(){
    controls.update(clock.getDelta());
    requestAnimationFrame( animate );
    render();

    stats.update();

}

function render(){
    renderer.render(scene, camera);
}


function connectToPeer(){

    var c= peer.connect(document.querySelector('#pid2').value);
    c.on('open', function(){
        connect(c);
    });
    c.on('error', function(err){ alert(err) });


}
function sendHello(){
    conn.send("hello world");
}

module.exports;