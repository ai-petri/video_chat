class User extends EventTarget
        {
            connection;
            remoteStream;
            localStream;
            dataChannels = [];
            id;
            name;
            image;
                  
            constructor(stream, sendText, id, name, image)
            {
                super();
                this.initConnection();
                this.id = id;
                this.name = name;
                this.image = image;
                this.localStream = stream;
                this.sendText = sendText;
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
                            this.dispatchEvent(new Event("connected"));
                        }                        
                    }

                this.connection.ondatachannel = e =>
                    {
                        console.log("ondatachannel");
                        e.channel.onmessage = e =>
                        {
                            console.log(e.data);
                        }
                        this.dataChannels.push(e.channel);           
                    }
                this.connection.onnegotiationneeded = async e =>
                {
                    console.log("negotiation needed, ice state = " + this.connection.iceConnectionState);

                    let offer = await this.connection.createOffer();
                    await this.connection.setLocalDescription(offer);
                    this.sendObject(offer);
                                      
                }

            }

            async addData(data)
            {
                if(data.type)
                {
                        if(data.type == "offer")
                        {
                            try
                            {
                                this.localStream.getTracks().forEach(track=>this.connection.addTrack(track));
                            }
                            catch(e){console.log(e)};
                            
                            this.connection.setRemoteDescription(new RTCSessionDescription(data));
                            console.log("remote description set");
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
                if (this.connection.iceConnectionState !== "new") return;

                var dataChannel = this.connection.createDataChannel("channel");
                dataChannel.onmessage = e =>
                {
                    console.log(e.data);
                }
                this.dataChannels.push(dataChannel);

                this.localStream.getTracks().forEach(track=>this.connection.addTrack(track));
                var offer = await this.connection.createOffer();
                await this.connection.setLocalDescription(offer);

                this.sendObject(offer);
            }

            createDataChannel(name)
            {         
                var dataChannel = this.connection.createDataChannel(name);
                dataChannel.onmessage = e =>
                {
                    console.log(e.data);
                }
                this.dataChannels.push(dataChannel); 
            }

            disconnect()
            {
                this.connection.close();
                this.dataChannel = null;
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

