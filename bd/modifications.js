var repository = require("./repository");
var repositoryModifications = {
    'collection': repository.getCollection('commits'),
	'objectCollection': repository.getCollection('object'),
    'add': function (modification, callback) {
        this.collection.insert(modification, function(err, docs) {
            if(err) {
                throw new Error('Insertion fail');
            }
            callback(docs);
        })
    },'createScene': function (idScene,values, callback) {
		this.sceneCollection.update(idScene,values, function(err, docs) {
			if(err) {
				throw new Error('Create scene fail');
			}
			callback(docs);
		})
	},
	'getScene': function (idScene, callback) {
		this.sceneCollection.find(idScene, function(err, docs) {
			if(err) {
				throw new Error('Get scene fail');
			}
			callback(docs);
		})
	},
	'saveScene': function (idScene,values, callback) {

			this.sceneCollection.update({"id":idScene},values,{upsert:false}, function(err, docs) {
				if(err) {
					throw new Error('update fail');
				}
				callback(docs);
			})
	},
	'updateInScene': function (idScene,UUIDObject,values, callback) {

		this.objectCollection.update({"idScene":idScene,"uuid":UUIDObject},values,{upsert:true,multi:false}, function(err, docs) {
			if(err) {
				throw new Error('findAndModify fail');
			}
			callback(docs);
		})
	}

};
module.exports=repositoryModifications;