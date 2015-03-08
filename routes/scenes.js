/**
 * Created by caroline on 08/03/15.
 */
var express = require('express');
var router = express.Router();
//var bdScene= require("../bd/bdScene");
/* GET scene page. */

/*
//get all scenes
router.get('/', function(req, res) {
	//bdScene.getAll();
	res.status(200).end();
});

//create scene
router.post('/', function(req, res) {
	//bdScene.create();
	res.status(200).end();
});

//get sceneId
router.get('/:sceneId', function(req, res) {
	var sceneId=req.params.sceneId;
	//bdScene.get(sceneId);
	res.status(200).end();
});

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
//post new object
router.post('/:sceneId/objects', function(req, res) {
	var sceneId=req.params.sceneId;
	var objectValues=JSON.stringify(req.body.obj);
	//bdScene.addObject(sceneId,objectValues);
	res.status(200).end();
});
//update objectId
router.put('/:sceneId/objects/:objectId', function(req, res) {
	var sceneId=req.params.sceneId;
	var objectId=req.params.objectId;
	var objectValues=JSON.stringify(req.body.obj);
	//bdScene.updateObject(sceneId,objectId,objectValues);
	res.status(200).end();
});
//delete objectId
router.delete('/:sceneId/objects/:objectId', function(req, res) {
	var sceneId=req.params.sceneId;
	var objectId=req.params.objectId;
	//bdScene.deleteObject(sceneId,objectId);
	res.status(200).end();
});

module.exports = router;