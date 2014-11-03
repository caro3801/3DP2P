/**
 * Created by caroline on 30/10/14.
 */

var startButton = document.querySelector("#startButton");
var sendButton = document.querySelector("#sendButton");
var closeButton = document.querySelector("#closeButton");

startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;

var sendChannel ,receiveChannel ;


var RTC = function RTC(){
    "use strict";

    startButton.addEventListener("click", this.createConnection,false);
    sendButton.addEventListener("click", function(val){ this.sendData(val);},false);
    closeButton.addEventListener("click", this.closeDataChannels,false);
};

function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}


RTC.prototype.createConnection=function createConnection() {
    var servers = null;
    window.localPeerConnection = new webkitRTCPeerConnection(servers,
        {optional: [
            {RtpDataChannels: true}
        ]});
    trace('Created local peer connection object localPeerConnection');

    try {
        // Reliable Data Channels not yet supported in Chrome
        sendChannel = localPeerConnection.createDataChannel("sendDataChannel",
            {reliable: false});
        trace('Created send data channel');
    } catch (e) {
        alert('Failed to create data channel. ' +
            'You need Chrome M25 or later with RtpDataChannel enabled');
        trace('createDataChannel() failed with exception: ' + e.message);
    }
    localPeerConnection.onicecandidate = gotLocalCandidate;
    sendChannel.onopen = handleSendChannelStateChange;
    sendChannel.onclose = handleSendChannelStateChange;

    window.remotePeerConnection = new webkitRTCPeerConnection(servers,
        {optional: [{RtpDataChannels: true}]});
    trace('Created remote peer connection object remotePeerConnection');

    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.ondatachannel = gotReceiveChannel;

    localPeerConnection.createOffer(gotLocalDescription);
    startButton.disabled = true;
    closeButton.disabled = false;
};

RTC.prototype.sendData = function sendData(val) {

    var data = val/* document.getElementById("dataChannelSend").value*/;
    sendChannel.send(data);
    trace('Sent data: ' + data);
};


RTC.prototype.closeDataChannels = function closeDataChannels() {
    trace('Closing data channels');
    sendChannel.close();
    trace('Closed data channel with label: ' + sendChannel.label);
    receiveChannel.close();
    trace('Closed data channel with label: ' + receiveChannel.label);
    localPeerConnection.close();
    remotePeerConnection.close();
    localPeerConnection = null;
    remotePeerConnection = null;
    trace('Closed peer connections');
    startButton.disabled = false;
    sendButton.disabled = true;
    closeButton.disabled = true;

};


function gotLocalDescription(desc) {
    localPeerConnection.setLocalDescription(desc);
    trace('Offer from localPeerConnection \n' + desc.sdp);
    remotePeerConnection.setRemoteDescription(desc);
    remotePeerConnection.createAnswer(gotRemoteDescription);
}
function gotRemoteDescription(desc) {
    remotePeerConnection.setLocalDescription(desc);
    trace('Answer from remotePeerConnection \n' + desc.sdp);
    localPeerConnection.setRemoteDescription(desc);
}

function gotLocalCandidate(event) {
    trace('local ice callback');
    if (event.candidate) {
        remotePeerConnection.addIceCandidate(event.candidate);
        trace('Local ICE candidate: \n' + event.candidate.candidate);
    }
}

function gotRemoteIceCandidate(event) {
    trace('remote ice callback');
    if (event.candidate) {
        localPeerConnection.addIceCandidate(event.candidate);
        trace('Remote ICE candidate: \n ' + event.candidate.candidate);
    }
}

function gotReceiveChannel(event) {
    trace('Receive Channel Callback');
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleMessage;
    receiveChannel.onopen = handleReceiveChannelStateChange;
    receiveChannel.onclose = handleReceiveChannelStateChange;
}

function handleMessage(event) {
    trace('Received message: ' + event.data);
    alert('Received message: ' + event.data);
    //document.getElementById("dataChannelReceive").value = event.data;
}

function handleSendChannelStateChange() {
    var readyState = sendChannel.readyState;
    trace('Send channel state is: ' + readyState);
    if (readyState == "open") {

        sendButton.disabled = false;
        closeButton.disabled = false;
    } else {
        sendButton.disabled = true;
        closeButton.disabled = true;
    }
}

function handleReceiveChannelStateChange() {
    var readyState = receiveChannel.readyState;
    trace('Receive channel state is: ' + readyState);
}
module.exports = RTC;