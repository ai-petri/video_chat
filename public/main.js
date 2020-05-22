
        var currentUser;

        var ws = new WebSocket("ws://"+location.host);

        var stream = new MediaStream();
        
        var localVideo = document.querySelector("#local-video");
        
        var buttons = document.querySelectorAll(".controls");

        var selected;
        var userConnections = new Set();
        var userList = document.querySelector("user-list");
        userList.addEventListener("selected", e=>
        {
            for(const c of userConnections)
            {
                if(c.id == userList.selected.id)
                {
                    selected = c;
                    break;
                }
            }

            for(const button of buttons)
            {
                button.hidden = false;
            }
        })

        userList.addEventListener("deselected", e=>
        {
            for(const button of buttons)
            {
                button.hidden = true;
            }
        })

        
        

        


       ws.onmessage = async message=>
       {
           
           message = JSON.parse(message.data);

           if(message.type == "data")
           {
               userConnections.forEach(connection =>
               {
                   if(connection.id == message.from)
                   {
                       connection.addData(JSON.parse(message.data));                       
                   }
               });
           }

           if(message.type == "text")
           {
               console.log(message.data);
               document.body.appendChild(new TextMessage(message));
           }

           if(message.type == "update")
           {
                let id = message.data.id;
                let users = message.data.users.map(user=>JSON.parse(user));
                let ids = users.map(user=>user.id);
                console.log(message.data);

                users.forEach(user=>
                {    
                   
                    if(id==user.id)
                    {
                        currentUser = user;
                        document.querySelector("#name").innerHTML = currentUser.name;
                        return;
                    }

                    //новое соединение
                   if(!userList.has(user))
                   {                        
                       let connection = new UserConnection(stream,sendText,user.id);
                       let video = document.createElement("video");
                        
                       connection.addEventListener("connected", e=>
                       {
                            video.srcObject = connection.remoteStream;                           
                            document.body.appendChild(video);
                            video.play();
                       });
                       
                       connection.addEventListener("disconnected", e=>
                       {
                           video.parentNode.removeChild(video);
                       })

                       userConnections.add(connection);
                       userList.add(user);
                   }                                      
               });

                userConnections.forEach(connection =>
                {
                    if(!ids.includes(connection.id))
                    {
                        console.log(connection);
                        userConnections.delete(connection);
                        userList.deleteById(connection.id);
                    }
                   
                });
 
            }                     
        }

        
        async function init()
        {
            //stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
            localVideo.srcObject = stream;
            localVideo.play();            
            userConnections.forEach(c=>c.localStream = stream);
            
            
            var menuButtons = document.querySelectorAll(".dropdown-button");
            for(const button of menuButtons)
            {
                let menu = button.parentNode.querySelector('.dropdown-menu');
                if(menu)
                {
                    button.onclick = function(e)
                    {
                        e.preventDefault();
                        e.stopPropagation();
                        let replaced = menu.classList.replace('hidden', 'visible')
                        if(!replaced)
                        {
                            menu.classList.replace('visible', 'hidden')
                        }
                    }
                }                
            }
            document.body.onclick = function(e)
            {
                e.stopPropagation();
                document.querySelectorAll('.visible').forEach(item=>
                    {
                        item.classList.remove('visible');
                        item.classList.add('hidden');
                    }
                );
            }
        }

        document.body.onload = init;

        function sendText(text)
        {
            ws.send(text);
        }

        function uploadIcon(file)
        {
            var image = new Image();
            image.src = URL.createObjectURL(file); 
            var canvas = document.querySelector("#image-preview");
            
            image.onload = function(e)
            {
                canvas.height = (canvas.width/image.width)*image.height
                var ctx = canvas.getContext("2d");
                ctx.drawImage(image,0,0,canvas.width, canvas.height);           
            }
            
        }


        function switchTab(groupClass,tabId)
        {
            var tabs = [...document.querySelectorAll(".tab")].filter(tab=>tab.classList.contains(groupClass));
            for(let tab of tabs)
            {
                if (tab.id == tabId)
                {
                    tab.style.visibility = "visible";
                }
                else
                {
                    tab.style.visibility = "hidden";
                }
            }
        }