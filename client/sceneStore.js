/**
 * Created by caroline on 08/03/15.
 */
var XHR = require('./XHR');
var sceneStore = {

};
/*
sceneStore.createScene = function(creatorId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.post("scene/create",true);
	xhr.addSuccessCallBack(function(){
		console.log("Scene created");
	});
	xhr.send(creatorId);
	var value = JSON.parse(xhr.jsonText);
	return value;
};
sceneStore.get = function(sceneId){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.get("scene/"+sceneId,true);
	xhr.addSuccessCallBack(function(){
		console.log("Scene " + sceneId + "ok");
	});
	xhr.send(null);
	var value = JSON.parse(xhr.jsonText);
	return value;

};

sceneStore.getAll = function(){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.get("scene/",true);
	xhr.addSuccessCallBack(function(){
		console.log("All scenes ok");
	});
	xhr.send(null);
	var value = JSON.parse(xhr.jsonText);
	return value;

};
sceneStore.update = function(sceneId,values){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.put("scene/"+sceneId+"/update",false);
	xhr.addSuccessCallBack(function(){
		console.log("Scene " + sceneId + " updated");
	});
	xhr.send(values);
	return JSON.parse(xhr.jsonText);

};
sceneStore.remove = function(sceneId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.delete("scene/"+sceneId+"/delete",true);
	xhr.addSuccessCallBack(function(){
		console.log("Scene " + sceneId + " deleted");
	});
	xhr.send(null);

	return JSON.parse(xhr.jsonText);

};*/
sceneStore.addObject = function(sceneId,values,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.post("scenes/"+sceneId+"/objects",false);
	xhr.addSuccessCallBack(function(){
		console.log("Object added to scene " + sceneId );
	});
	xhr.send(JSON.stringify(values));

	return JSON.parse(xhr.jsonText);

};
sceneStore.updateObject = function(sceneId,objectId,values , callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.put("scenes/"+sceneId+"/objects/"+objectId,false);
	xhr.addSuccessCallBack(function(){
		console.log("Object"+ objectId+" updated in scene " + sceneId );
	});
	xhr.send(JSON.stringify(values));

	return JSON.parse(xhr.jsonText);

};
sceneStore.removeObject = function(sceneId,objectId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());

	xhr.delete("scenes/"+sceneId+"/objects/"+objectId,true);
	xhr.addSuccessCallBack(function(){
		console.log("Object"+ objectId+" updated in scene " + sceneId );
	});
	xhr.send(null);

	return JSON.parse(xhr.jsonText);

};

sceneStore.sendToServer = function(message,sceneId,values){
	switch (message) {
		case 'objectAdded':
			this.addObject(sceneId,values);
			break;
		case 'dropEnded':
			this.addObject(sceneId,values);
			break;
		case 'objectRemoved':
			this.removeObject(sceneId,values.message.uuid); //values === uuid
			break;
		case 'objectChanged':
			this.updateObject(sceneId,values.message.uuid,values);
			break;
	}

};
module.exports=sceneStore;