var express = require('express');
var router = express.Router();

var bdScene= require("../bd/bdScene");
/* GET home page. */
router.get('/', function(req, res) {
	bdScene.getAll(function(results){
		res.render('index',{title:'3DP2P',subtitle:"Scenes",scenes:results});
	});
});
module.exports = router;
