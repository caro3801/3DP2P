var XHR = require('./XHR');
var peerStore = function peerStore(){

};

peerStore.prototype.add = function add(id){
    var xhr = new XHR(XHR.createXMLHttpRequest());
    xhr.get("/peer/add/"+id, false);
    xhr.send(null);
    var jsonCollection = JSON.parse(xhr.jsonText);

    return jsonCollection;
};

peerStore.prototype.remove = function remove(id){
    var xhr = new XHR(XHR.createXMLHttpRequest());
    xhr.get("/peer/remove/"+id, false);
    xhr.send(null);
    var jsonCollection = JSON.parse(xhr.jsonText);

    return jsonCollection;
};
//module.exports = peerStore;