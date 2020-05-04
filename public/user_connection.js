class UserConnection extends EventTarget
        {
            connection;
            remoteStream;
            localStream;            
            constructor(stream)
            {
                super();
                this.initConnection();
                this.localStream = stream;
                this.connected = new CustomEvent("connected", {detail: {stream: this.remoteStream}})
                this.disconnected = new Event("disconnected");
            }

            initConnection()
            {
                this.remoteStream = new MediaStream();
                this.connection = new RTCPeerConnection();
                this.connection.onicecandidate = e=>
                    {
                        if(e.candidate)
                        {
                            ws.send(JSON.stringify(e.candidate));
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
                            this.dispatchEvent(this.connected);
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
                            ws.send(JSON.stringify(answer))
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

                ws.send(JSON.stringify(offer));
            }

            disconnect()
            {
                this.connection.close();
                this.dispatchEvent(this.disconnected);                
                this.initConnection();
            }

        }

