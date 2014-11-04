"use strict";
var Scene = require("./Scene");
var User = require("./User");
document.addEventListener("DOMContentLoaded",function(event) {
    var s = new Scene(document.querySelector("#container"));
    var u = new User(document.querySelector("#pid"));
    document.querySelector("#addCube").addEventListener("click", function () {
        s.addCube();
        if (u.conn) {
             u.conn.send(
             JSON.stringify({"action": "addCube"})
             );
        }
    }, false);

    document.querySelector("#connect").addEventListener("click", function(){u.connectToPeer();}, false);
    document.querySelector("#sendButton").addEventListener("click", u.sendHello, false);
    s.init();
    s.animate();
    s.addObjectsToScene();
    u.setScene(s);

});


module.exports;