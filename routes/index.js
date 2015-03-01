var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.post('/save', function(req, res) {
    console.log(req);
    res.send(200);
});
module.exports = router;
