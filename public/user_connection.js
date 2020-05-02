class UserConnection
        {
            connection;
            remoteStream;
            localStream;
            video;
            constructor(stream)
            {
                this.initConnection();
                this.remoteStream = new MediaStream();
                this.video = document.createElement("video");
                this.video.srcObject = this.remoteStream;
                this.localStream = stream;
            }

            initConnection()
            {
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
                        document.body.appendChild(this.video);
                        this.video.play();
                    }

                this.connection.oniceconnectionstatechange = e =>
                    {
                        if(this.connection.iceConnectionState == "disconnected")
                        {
                            this.disconnect();
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
                this.initConnection();
            }

        }

