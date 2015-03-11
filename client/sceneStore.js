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
};*/
sceneStore.get = function(sceneId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.get("/scenes/"+sceneId,true);
	xhr.addSuccessCallBack(function(results){

		callback(results);
	});
	xhr.send(null);
	var value = JSON.parse(xhr.jsonText);
	return value;
};
/*
sceneStore.getAll = function(){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.get("scenes/",true);
	xhr.addSuccessCallBack(function(){
		console.log("All scenes ok");
	});
	xhr.send(null);
	var value = JSON.parse(xhr.jsonText);
	return value;

};
sceneStore.update = function(sceneId,values){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.put("scenes/"+sceneId+"/update",false);
	xhr.addSuccessCallBack(function(){
		console.log("Scene " + sceneId + " updated");
	});
	xhr.send(values);
	return JSON.parse(xhr.jsonText);

};
sceneStore.remove = function(sceneId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.delete("scenes/"+sceneId+"/delete",true);
	xhr.addSuccessCallBack(function(){
		console.log("Scene " + sceneId + " deleted");
	});
	xhr.send(null);

	return JSON.parse(xhr.jsonText);

};*/
sceneStore.getObjects = function(sceneId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.get("/scenes/"+sceneId+"/objects",true );
	xhr.addSuccessCallBack(callback);
	xhr.send(null);

};
sceneStore.addObject = function(sceneId,values,userId){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.post("/scenes/"+sceneId+"/objects"+"/user/"+userId,true);
	xhr.addSuccessCallBack(function(){
		console.log("Object added to scene " + sceneId );
	});
	xhr.send(JSON.stringify(values));

};
sceneStore.updateObject = function(sceneId,objectId,values,userId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.put("/scenes/"+sceneId+"/objects/"+objectId+"/user/"+userId,true);
	xhr.addSuccessCallBack(function(){
		console.log("Object "+ objectId+" updated in scene " + sceneId );
	});
	xhr.send(JSON.stringify(values));

};
sceneStore.removeObject = function(sceneId,objectId,userId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());

	xhr.delete("/scenes/"+sceneId+"/objects/"+objectId+"/user/"+userId,true);
	xhr.addSuccessCallBack(function(){
		console.log("Object "+ objectId+" removed from scene " + sceneId );
	});
	xhr.send(null);

};

sceneStore.getUsers = function(sceneId,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.get("/scenes/"+sceneId+"/users",true);
	xhr.addSuccessCallBack(callback);
	xhr.send(null);

};

sceneStore.addUser = function(sceneId,userValues,callback){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.post("/scenes/"+sceneId+"/users",true);
	xhr.addSuccessCallBack(callback);
	xhr.send(JSON.stringify(userValues));

};

sceneStore.removeUser = function(sceneId,userId){
	var xhr = new XHR(XHR.createXMLHttpRequest());
	xhr.delete("/scenes/"+sceneId+"/users/"+userId,true);
	xhr.addSuccessCallBack(function(){
		console.log("User left scene " + sceneId );
	});
	xhr.send(null);

};
sceneStore.sendToServer = function(sceneId,data){

	switch (data.type) {
		case 'objectAdded':
			this.addObject(sceneId,data.message.object,data.userId);
			break;
		case 'dropEnded':
			this.addObject(sceneId,data.message.object,data.userId);
			break;
		case 'objectRemoved':
			this.removeObject(sceneId,data.message.uuid,data.userId); //values === uuid
			break;
		case 'objectChanged':
			this.updateObject(sceneId,data.message.uuid,data.message.object,data.userId);
			break;
	}

};
module.exports=sceneStore;