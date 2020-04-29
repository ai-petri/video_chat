const express = require("express");
const ws = require("ws");



var app = express();


app.use(express.static("./public"));

var server = app.listen(80);


var wsServer = new ws.Server({server});

var connections = [];

wsServer.on("connection", connection=>
{
    console.log(connection._socket.remoteAddress + "connected");
    connections.push(connection);

    connection.on("message", message=>
    {
        connections.forEach(c=>
            {
                if(c!==connection)
                {
                    c.send(message);
                } 
            });                       
    });
    
    connection.on("close", e=>
    {
        connections = connections.filter(c=>c!==connection);
        console.log(connection._socket.remoteAddress + "disconnected, " + connections.length);
    });


})




process.stdin.setRawMode(true);

process.stdin.on("data", data =>process.exit());