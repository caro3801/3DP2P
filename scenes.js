var repository = require("./repository");
var repositoryModifications = {
    'collection': repository.getCollection('scenes'),
    'create': function (scene, callback) {
        this.collection.insert(scene, function(err, docs) {
            if(err) {
                //FIXME à gérer
                throw new Error('Insertion fail');
            }
            callback(modification);
        })
    },
    'get': function (sceneId, callback) {
        this.collection.insert({id:sceneId}, function(err, scene) {
            if(err) {
                //FIXME à gérer
                throw new Error('Insertion fail');
            }
            callback(scene);
        })
    }


};
module.exports=repositoryModifications;