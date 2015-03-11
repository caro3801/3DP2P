var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var config = require("./configuration").mongo;

var repository = {
    'mongoclient': null,
    'db': null,
    'init': function() {
        this.db = new Db(config.data_name, new Server(config.url, config.port, {auto_reconnect: true}), {safe:false});
        this.db.open(function(err, db) {
        });
    },
    'getCollection': function (collectionName) {
        return this.db.collection(collectionName);
    },
    'test':function() {
        var MongoClient = require('mongodb').MongoClient
            , format = require('util').format;

        MongoClient.connect('mongodb://127.0.0.1:27017/3Dp2p', function(err, db) {
            if(err) throw err;

            var collection = db.collection('modifications');
            collection.insert({a:3}, function(err, docs) {

                collection.count(function(err, count) {
                    console.log(format("count = %s", count));
                });

                // Locate all the entries using find
                collection.find().toArray(function(err, results) {
                    console.dir(results);
                    // Let's close the db
                    db.close();
                });
            });
        })
    }
};
repository.init();
module.exports=repository;