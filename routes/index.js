var express = require('express');
var router = express.Router();
var repositoryModifications= require("../bd/modifications");
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.post('/get/', function(req, res) {
	//var jsonS=JSON.stringify(req.body.obj);
	bdScene.add(req.body.obj,function(modification){
		res.status(200).end();
	});
});
router.post('/save', function(req, res) {
    //var jsonS=JSON.stringify(req.body.obj);
	var sceneId=req.params.sceneId;
    repositoryModifications.add(sceneId,function(sceneId){
        res.status(200).end();
    });
});
module.exports = router;
