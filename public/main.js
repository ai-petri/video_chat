
        var currentUser;

        var ws = new WebSocket("ws://"+location.host);

        var stream = new MediaStream();
        
        var localVideo = document.querySelector("#local-video");

        var remoteVideo = document.querySelector("#remote-video");

        var textMessages = document.querySelector("#all-messages");

        var messageInput = document.querySelector("#message-input");

        var mixer = document.querySelector("#mixer");

        var selected;

       
        
        var userList = document.querySelector("user-list");
        userList.addEventListener("selected", e=>
        {
            selected = userList.selected;
            loadVideo();
        })
        userList.addEventListener("deselected", e=>
        {
            if(selected)
            {
                selected.disconnect();
                loadVideo();
            }
        });
        


        


       ws.onmessage = async message=>
       {
           
           message = JSON.parse(message.data);


           if(message.type == "data")
           {
               userList.getUserById(message.from).addData(JSON.parse(message.data));
           }

           if(message.type == "text")
           {
               textMessages.appendChild(new TextMessage(userList.getUserById(message.from),message.data));
           }

           if(message.type == "update")
           {
                let id = message.data.id;
                let users = message.data.users.map(user=>JSON.parse(user));
                let ids = users.map(user=>user.id);


                users.forEach(userinfo=>
                {    
                   
                    if(id==userinfo.id)
                    {
                        currentUser = userinfo;
                        document.querySelector("#name").innerHTML = currentUser.name;
                        document.querySelector("#user").querySelector(".icon").src = userinfo.image? userinfo.image: "default_icon.svg";
                        return;
                    }

                    //новое соединение
                   if(!userList.has(userinfo))
                   {                        
                       let user = new User(stream,sendText,userinfo.id,userinfo.name,userinfo.image);
                        
                       user.addEventListener("connected", connectionEventHandler);                
                       user.addEventListener("disconnected", connectionEventHandler);
                       userList.add(user);
                   }              
                    else
                    {
                       let u = userList.getUserById(userinfo.id);
                       u.name = userinfo.name;
                       u.image = userinfo.image;
                       userList.update();
                    }
                                                         
               });

                userList.getIds().forEach(id =>
                {
                    if(!ids.includes(id))
                    {
                       let u = userList.getUserById(id);
                       u.removeEventListener("connected", connectionEventHandler);                
                       u.removeEventListener("disconnected", connectionEventHandler);
                       if(u.audioChannel)
                       {
                           u.audioChannel.parentNode.removeChild(u.audioChannel);
                       }
                       userList.delete(u);
                    }
                   
                });
 
            }                     
        }

        
        async function init()
        {
            stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
            localVideo.srcObject = stream;
            
            localVideo.play();            
            userList.users.forEach(u=>u.localStream = stream);
            
            
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

        function addIcon(file)
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

        function saveSettings()
        {
            var name = document.querySelector("#name-input").value;
            var imageURL = document.querySelector("#image-preview").toDataURL();
           
            var message =
            {
                to: "system",
                type: "settings",
                data: 
                {
                    name: name,
                    image: imageURL
                }
            }

           sendText(JSON.stringify(message));            
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


        function sendTextMessage()
        {
            if(!selected) return;
            selected.sendTextMessage(messageInput.value);
            textMessages.appendChild(new TextMessage(currentUser,messageInput.value));
            messageInput.value = "";
        }


        function loadVideo()
        {       
            if(selected && selected.connected)
            {
                remoteVideo.srcObject = selected.remoteStream;
                remoteVideo.play(); 
            }
            else
            {
                remoteVideo.srcObject = null;
                remoteVideo.load();          
            } 
        }

        function connectionEventHandler(e)
        {
            if(e.target === selected)
            {
                loadVideo();               
            }


            
            if(e.type === "connected" && !e.target.audioChannel)
            {
                e.target.audioChannel = new AudioChannel();
                mixer.appendChild(e.target.audioChannel);
                e.target.audioChannel.addStream(e.target.remoteStream);

            }
            if(e.type === "disconnected" && e.target.audioChannel)
            {        
                e.target.audioChannel.parentNode.removeChild(e.target.audioChannel);
                e.target.audioChannel = null;
            }
        }

       