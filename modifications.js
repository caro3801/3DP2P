var repository = require("./repository");
var repositoryModifications = {
    'collection': repository.getCollection('commits'),
    'add': function (modification, callback) {
        this.collection.insert(modification, function(err, docs) {
            if(err) {
                //FIXME à gérer
                throw new Error('Insertion fail');
            }
            callback(modification);
        })
    }


};
module.exports=repositoryModifications;