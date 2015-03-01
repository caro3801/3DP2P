var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/add/:id', function(req, res) {
    res.send('respond with a resource');
});
router.get('/remove/:id', function(req, res) {
    res.send('respond with a resource');
});
module.exports = router;
