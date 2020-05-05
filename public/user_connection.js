class UserConnection extends EventTarget
        {
            connection;
            remoteStream;
            localStream;            
            constructor(stream, send)
            {
                super();
                this.initConnection();
                this.localStream = stream;
                this.send = send;
            }

            initConnection()
            {
                this.remoteStream = new MediaStream();
                this.connection = new RTCPeerConnection();
                this.connection.onicecandidate = e=>
                    {
                        if(e.candidate)
                        {
                            this.send(JSON.stringify(e.candidate));
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

            }

            async addData(data)
            {
                if(data.type)
                {
                        if(data.type == "offer")
                        {
                            
                            this.localStream.getTracks().forEach(track=>this.connection.addTrack(track));
                            this.connection.setRemoteDescription(new RTCSessionDescription(data));
                            
                            var answer = await this.connection.createAnswer();
                            await this.connection.setLocalDescription(answer);
                            this.send(JSON.stringify(answer))
                        }

                        if(data.type == "answer")
                        {
                            this.connection.setRemoteDescription(data);
                        }  
                }
                if(data.candidate)
                {                   
                    this.connection.addIceCandidate(data).then(()=>{console.log("ice candidate added")}).catch(reason=>console.log(reason));
                }
            }


            async connect()
            {            
                this.localStream.getTracks().forEach(track=>this.connection.addTrack(track));

                var offer = await this.connection.createOffer();
                await this.connection.setLocalDescription(offer);

                this.send(JSON.stringify(offer));
            }

            disconnect()
            {
                this.connection.close();
                this.dispatchEvent(new Event("disconnected"));                
                this.initConnection();
            }

        }

