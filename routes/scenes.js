/**
 * Created by caroline on 08/03/15.
 */
var express = require('express');
var router = express.Router();
var bdScene= require("../bd/bdScene");
/* GET scene page. */



//create scene
router.post('/', function(req, res) {
	//bdScene.create();
	res.status(200).end();
});


//get sceneId
router.get('/:sceneId', function(req, res) {
	var sceneId=req.params.sceneId;
	bdScene.get(sceneId,function(err,results){
		if(req.accepts("text/html")){
			res.render('editor',{subtitle:'Scene editor',scene:results});
		} else if(req.accepts("application/json")){
			res.json(results);
		}
	});
});

//get all scenes
router.get('/', function(req, res) {
	bdScene.getAll(function(results){
		res.json(results);
	});
});
/*
//update sceneId
router.put('/:sceneId', function(req, res) {
	var sceneId=req.params.sceneId;
	var values=JSON.stringify(req.body.obj);
	//bdScene.update(sceneId,values);
	res.status(200).end();
});

//delete sceneId
router.delete('/:sceneId', function(req, res) {
	var sceneId=req.params.sceneId;
	//bdScene.delete(sceneId);
	res.status(200).end();
});
*/
//get objects in scene
router.get('/:sceneId/objects', function(req, res) {
	var sceneId=req.params.sceneId;
	bdScene.getObjects(sceneId,function(err,results){
		res.json(results);
	});
});
//post new object
router.post('/:sceneId/objects', function(req, res) {
	var sceneId=req.params.sceneId;
	var objectValues=req.body;
	bdScene.addObject(sceneId,objectValues,function(results){

		res.status(200).end();
	});
});
//get objectId
router.get('/:sceneId/objects/:objectId', function(req, res) {
	var sceneId=req.params.sceneId;
	var objectId=req.params.objectId;
	bdScene.getObject(sceneId,objectId,function(results){

		res.status(200).end();
	});
});
//update objectId
router.put('/:sceneId/objects/:objectId', function(req, res) {
	var sceneId=req.params.sceneId;
	var objectId=req.params.objectId;
	var objectValues=req.body;
	bdScene.updateObject(sceneId,objectId,objectValues,function(results){

		res.status(200).end();
	});
});
//delete objectId
router.delete('/:sceneId/objects/:objectId', function(req, res) {
	var sceneId=req.params.sceneId;
	var objectId=req.params.objectId;
	bdScene.deleteObject(sceneId,objectId,function(results){

		res.status(200).end();
	});

});

module.exports = router;