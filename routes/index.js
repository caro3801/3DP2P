var express = require('express');
var router = express.Router();
var bdScene= require("../bd/bdScene");

var logger = require('./logger');
/* GET home page. */
router.get('/', function(req, res) {
	res.render('index',{title:'3DP2P',subtitle:"Welcome"});

});
module.exports = router;
