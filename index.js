const express = require("express");
const ws = require("ws");



var app = express();


app.use(express.static("./public"));

var server = app.listen(80);


var wsServer = new ws.Server({server});


var users = [];

wsServer.on("connection", connection=>
{
    console.log(connection._socket.remoteAddress + "connected");
    
    users.push({id: new Date().getTime(), connection: connection});

    users.forEach(user=>
        {
            user.connection.send(JSON.stringify({from: "system", type: "update", data: {id: user.id, users: users.map(u=>u.id)}}));
        }); 
   
    connection.on("message", message=>
    {
        
        message = JSON.parse(message);
        users.forEach(user=>
            {
                if(user.connection!==connection)
                {
                    user.connection.send(JSON.stringify({from: user.id, type: message.type, data: message.data}));
                } 
            });                       
    });
    
    connection.on("close", e=>
    {
        users = users.filter(user => user.connection !== connection);
        users.forEach(user=>
            {
                user.connection.send(JSON.stringify({from: "system", type: "update", data: {id: user.id, users: users.map(u=>u.id)}}));
            }); 
        console.log(connection._socket.remoteAddress + "disconnected, " + users.length);
    });


})




process.stdin.setRawMode(true);

process.stdin.on("data", data =>process.exit());