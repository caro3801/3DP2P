var express = require('express');
var router = express.Router();
var repositoryModifications= require("../modifications");
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.post('/save', function(req, res) {
    //var jsonS=JSON.stringify(req.body.obj);
    repositoryModifications.add(req.body.obj,function(modification){
        res.status(200).end()
    });
});
module.exports = router;
