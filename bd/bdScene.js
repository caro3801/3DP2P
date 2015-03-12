/**
 * Created by caroline on 08/03/15.
 */
var repository = require("./repository");

var bdScene = {
	"sceneCollection" : repository.getCollection('scene'),
	"objectCollection": repository.getCollection('object'),

	/*"create":function(){
	 this.collection.insert();
	 },*/
	"get"             : function (sceneId, callback) {
		this.sceneCollection.findOne({sceneId: sceneId}, function (err, result) {
			if (err) {
				throw new Error('get fail');
			}
			callback(null, result);
		});
	},
	"getObjects"      : function (sceneId, callback) {
		this.objectCollection.find({sceneId: sceneId}, function (err, results) {
			if (err) {
				throw new Error('get fail');
			}
			results.toArray(callback);
		});
	},
	"getAll"          : function (callback) {
		this.sceneCollection.aggregate([{$project: {"_id": "$sceneId", label: "$label"}}], function (err, results) {
			if (err) {
				throw new Error('get fail');
			}
			callback(null, results);
		});
	}, /*
	 "update":function(sceneId,values){
	 this.collection.update(sceneId,values);
	 },
	 "delete":function(sceneId){
	 this.collection.delete(sceneId,values);

	 },*/


	"addUser"      : function (sceneId, userId, callback) {
		this.sceneCollection.update({"sceneId": sceneId}, {$push: {users: userId}}, function (err, results) {
			if (err) {
				throw new Error('get fail');
			}
			callback(results);
		});
	}, "removeUser": function (sceneId, userId, callback) {
		this.sceneCollection.update({"sceneId": sceneId}, {$pull: {users: userId}}, function (err, results) {
			if (err) {
				throw new Error('get fail');
			}
			callback(null, results);
		});
	}, "getUsers"  : function (sceneId, callback) {
		this.sceneCollection.findOne({"sceneId": sceneId}, {users: 1}, function (err, results) {
			if (err) {
				throw new Error('get fail');
			}
			callback(null, results);
		});
	},
	"addObject"    : function (sceneId, object, callback) {
		var uuid = object.object.uuid;
		this.objectCollection.insert({sceneId: sceneId, objectId: uuid, object: object}, function (err, results) {
			if (err) {
				throw new Error('Insertion fail');
			}
			callback(null, results);
		});
	},
	"updateObject" : function (sceneId, objectId, values, callback) {

		this.objectCollection.update(
			{sceneId: sceneId, "objectId": objectId},
			{
				$set: {
					"object": values
				}
			},
			function (err, results) {
				if (err) {
					throw new Error('update fail');
				}
				callback(null, results);
			}
		);

	},
	"getObject"    : function (sceneId, objectId, callback) {
		this.objectCollection.findOne(
			{sceneId: sceneId, objectId: objectId},
			function (err, results) {
				if (err) {
					throw new Error('Insertion fail');
				}
				callback(null, results);
			}
		);

	},
	"deleteObject" : function (sceneId, objectId, callback) {
		this.objectCollection.remove({sceneId: sceneId, objectId: objectId},
			function (err, results) {
				if (err) {
					throw new Error('Insertion fail');
				}
				callback(results);
			});

	},
	"flushUsers"   : function (sceneId, callback){
		this.sceneCollection.update({sceneId: sceneId},{$set: {users: []}},
				function (err, results) {
					if (err) {
						throw new Error('Insertion fail');
					}
					callback(results);

		});

	}
};

module.exports = bdScene;