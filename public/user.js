class User extends EventTarget
        {
            connection;
            connected = false;
            remoteStream;
            localStream;
            dataChannels = [];
            id;
            name;
            image;
                  
            constructor(stream, sendText, whiteboard, id, name, image)
            {
                super();
                this.initConnection();
                this.id = id;
                this.name = name;
                this.image = image;
                this.localStream = stream;
                this.sendText = sendText;
                this.whiteboard = whiteboard;
            }

            initConnection()
            {
                this.remoteStream = new MediaStream();
                this.connection = new RTCPeerConnection();
                this.connection.onicecandidate = e=>
                    {
                        if(e.candidate)
                        {
                            this.sendObject(e.candidate);
                        }
                    }

                this.connection.ontrack = e=>
                    {            
                        this.remoteStream.addTrack(e.track);
                    }

                this.connection.oniceconnectionstatechange = e =>
                    {
                        if(this.connection.iceConnectionState == "disconnected")
                        {
                            this.disconnect();
                        }
                        if(this.connection.iceConnectionState == "connected")
                        {
                            this.connected = true;
                            this.dispatchEvent(new Event("connected"));
                        }                        
                    }

                this.connection.ondatachannel = e =>
                    {
                        
                        e.channel.onmessage = e =>
                        {
                            let {n,x,y} = JSON.parse(e.data);
                            this.whiteboard.paint(n,x,y);

                        }
                        this.dataChannels.push(e.channel);           
                    }
            }

            async addData(data)
            {
                if(data.type)
                {
                        if(data.type == "offer")
                        {
                            if(this.connected)
                            {
                                this.disconnect();
                            }

                            this.localStream.getTracks().forEach(track=>this.connection.addTrack(track));
                            
                            this.connection.setRemoteDescription(new RTCSessionDescription(data));

                            var answer = await this.connection.createAnswer();
                            await this.connection.setLocalDescription(answer);
                            this.sendObject(answer);
                        }

                        if(data.type == "answer")
                        {
                            this.connection.setRemoteDescription(data);
                        }  
                }
                if(data.candidate)
                {                   
                    this.connection.addIceCandidate(data).then(()=>{console.log("ice candidate added")}).catch(reason=>{console.log(reason); this.disconnect()});
                }
            }


            async connect()
            {   

                this.createDataChannel("channel",  e =>
                {
                    let {n,x,y} = JSON.parse(e.data);
                    this.whiteboard.paint(n,x,y);

                });

                this.localStream.getTracks().forEach(track=>this.connection.addTrack(track));
                var offer = await this.connection.createOffer();
                await this.connection.setLocalDescription(offer);

                this.sendObject(offer);
            }

            createDataChannel(name, onmessage)
            {         
                var dataChannel = this.connection.createDataChannel(name);
                dataChannel.onmessage = onmessage
                this.dataChannels.push(dataChannel); 
            }

            disconnect()
            {
                
                this.remoteStream.getTracks().forEach(track => track.stop());           
                this.connection.onicecandidate = null;
                this.connection.ontrack = null
                this.connection.oniceconnectionstatechange = null;
                this.connection.ondatachannel = null;
                this.connection.close();
                this.dataChannels.forEach(channel=>channel.close());
                this.dataChannels = [];
                this.connected = false;
                this.dispatchEvent(new Event("disconnected"));        
                this.initConnection();
            }

            sendObject(obj)
            {
                var message =
                {
                    to: this.id,
                    type: "data",
                    data: JSON.stringify(obj)
                };

                this.sendText(JSON.stringify(message));
            }

            sendTextMessage(text)
            {
                var message =
                {
                    to: this.id,
                    type: "text",
                    data: text
                }

                this.sendText(JSON.stringify(message));
            }

        }

