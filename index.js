const express = require("express");
const ws = require("ws");

const {User} = require("./user.js");

var app = express();


app.use(express.static("./public"));

var server = app.listen(80);


var wsServer = new ws.Server({server});


var users = [];

wsServer.on("connection", connection=>
{
    console.log(connection._socket.remoteAddress + "connected");
    
    users.push(new User(connection));

    update();
     
    connection.on("message", message=>
    {
        
        message = JSON.parse(message);
        if(message.to == "system")
        {
            if(message.type == "settings")
            {
                users.filter(user => user.connection == connection).forEach(user=>
                {
                    user.name = message.data.name;
                    user.image = message.data.image;                   
                });

                

                update();
            }
            
        }
        else
        {
            users.forEach(user=>
                {
                    if(user.connection!==connection && message.to == user.id)
                    {
                        user.connection.send(JSON.stringify({from: getId(connection), type: message.type, data: message.data}));
                    } 
                }); 
        }
                              
    });
    
    connection.on("close", e=>
    {
        users = users.filter(user => user.connection !== connection);
        update();    
        console.log(connection._socket.remoteAddress + "disconnected, " + users.length);
    });


})

function update()
{
    users.forEach(user=>
    {
        user.connection.send(JSON.stringify({from: "system", type: "update", data: {id: user.id, users: users.map(u=>u.info)}}));
    }); 
}

function getId(connection)
{
   return users.filter(u=>u.connection == connection).map(u=>u.id)[0];
}

process.stdin.setRawMode(true);

process.stdin.on("data", data =>process.exit());