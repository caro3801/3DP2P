/**
 * Created by Tigrou on 02/07/2014.
 */
function XHR(xhr) {
    this.successCallBack = null;
    this.asynchrone = false;
    this.xhr = xhr;
    this.jsonText=null;
}

XHR.createXMLHttpRequest = function createXMLHttpRequest() {
    return XMLHttpRequest ? new XMLHttpRequest() : {}
};

XHR.prototype.get = function XHRGet(url, asynchrone) {
    this.jsonText=null;
    this.asynchrone = asynchrone;
    this.xhr.open("GET", url, this.asynchrone);
    this.xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
};

XHR.prototype.post = function XHRPost(url, asynchrone) {
    this.jsonText=null;
    this.asynchrone = asynchrone;
    this.xhr.open("POST", url, this.asynchrone);
    this.xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
};
XHR.prototype.delete = function XHRPost(url, asynchrone) {
	this.jsonText=null;
	this.asynchrone = asynchrone;
	this.xhr.open("DELETE", url, this.asynchrone);
	this.xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
};
XHR.prototype.put = function XHRPost(url, asynchrone) {
	this.jsonText=null;
	this.asynchrone = asynchrone;
	this.xhr.open("PUT", url, this.asynchrone);
	this.xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
};
XHR.prototype.postMP = function XHRPost(url, asynchrone) {
    this.jsonText=null;
    this.asynchrone = asynchrone;
    this.xhr.open("POST", url, this.asynchrone);
};

XHR.prototype.send = function XHRSend(params) {
    try {
        this.xhr.send(params);
    } catch (e) {
        console.log(e);
    }
    if (this.xhr.status === 200) {
        if (this.asynchrone) {
            if (this.successCallBack) {
                this.successCallBack(this.xhr.responseText);
            } else {
                throw new Error("Ton callBack il est où ?");
            }
        } else {
            this.jsonText = this.xhr.responseText;

        }
    } else if (this.xhr.status === 302) {
        var obj = JSON.parse(this.xhr.responseText);
        window.location.assign(obj.url);
        throw new Error("Redirect exception");
    }
};

XHR.prototype.addSuccessCallBack = function XHRAddSuccessCallBack(successCallBack) {
    this.successCallBack = successCallBack;
};



module.exports = XHR;