class AudioChannel extends HTMLElement
{

    canvas = document.createElement("canvas");
    
    input = document.createElement("input");

    audioContext = new AudioContext();

    gain;

    volume1 = 1;
    volume2 = 1;

    constructor(parameters)
    {
        super();

        
        this.processor = this.audioContext.createScriptProcessor(512);
        this.processor.onaudioprocess = event =>
        {
            var buffer1 = event.inputBuffer.getChannelData(0);
            var buffer2 = event.inputBuffer.getChannelData(1);
            var sum1 = 0;
            var sum2 = 0;


            for(let i=0; i<buffer1.length; i++)
            {
                sum1 += buffer1[i]*buffer1[i];
            }
            for(let i=0; i<buffer2.length; i++)
            {
                sum2 += buffer2[i]*buffer2[i];
            }
            this.volume1 = (this.volume1 + Math.floor(1000*Math.sqrt(sum1/buffer1.length)))/2;
            this.volume2 = (this.volume2 + Math.floor(1000*Math.sqrt(sum2/buffer2.length)))/2;                    
        }

        this.gain = this.audioContext.createGain();
        this.gain.connect(this.processor);
        if(!parameters || !parameters.quiet)
        {
            this.gain.connect(this.audioContext.destination);
        }
       
        this.destinationNode = this.audioContext.createMediaStreamDestination();
        this.gain.connect(this.destinationNode);
    }

    addStream(stream)
    {
        var source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.gain);                     
    }
    
    addTrack(track)
    {
        var source = this.audioContext.createMediaStreamTrackSource(track);
        source.connect(this.gain);
    }

    get track()
    {
        return this.destinationNode.stream.getAudioTracks()[0];
    }
    

    connectedCallback()
    {
        var shadow = this.attachShadow({mode: "open"});
        this.style.textAlign = "center";
        this.style.background = "lightgrey";
        this.style.padding = "5px";
        this.style.border = "1px solid grey"
        shadow.innerHTML = 
        `<style>
        input[type=range]
        {
            -webkit-appearance: slider-vertical;
           display: inline-block;
           background: rgba(0,0,0,0);
           height: 120px;
        }
        input[type=range]::-moz-range-thumb 
        {
            border: 1px solid black;
            height: 20px;
            width: 15px;  
            border-radius: 3px;
            background: repeating-linear-gradient(0deg, black, white 3px);      
        }
        input[type=range]::-moz-range-track 
        {
            border: 1px solid black;            
            border-radius: 3px;
            background: grey;
        }
        </style>
        
        `;

        this.canvas.width = 20;
        this.canvas.height = 100;
        this.canvas.style.background = "black";
        shadow.appendChild(this.canvas);
        shadow.innerHTML += "<br><br>";
        this.input.type = "range";
        this.input.min = 0;
        this.input.max = 1;
        this.input.step = 0.01;
        this.input.value = 1;
        this.input.setAttribute("orient", "vertical");
        this.input.oninput = e=>
        {
            this.gain.gain.value = this.input.value;
        }
        shadow.appendChild(this.input);
        
        var ctx = shadow.querySelector("canvas").getContext("2d",{ alpha: false });
        
        var green_height = 90;
        var red_height = 10;
        var green1;
        var green2;
        var red1;
        var red2;
        var animate = () =>
        {
            green1 = (this.volume1<green_height)? this.volume1 : green_height;
            green2 = (this.volume2<green_height)? this.volume2 : green_height;
            if(this.volume1>green_height)
            {
                red1 = this.volume1 - green_height;
                if(this.volume1>(green_height + red_height))
                {
                    red1 = red_height;
                }
            }
            else
            {
                red1 = 0;
            }
            
            if(this.volume2>green_height)
            {
                red2 = this.volume2 - green_height;
                if(this.volume2>(green_height + red_height))
                {
                    red2 = red_height;
                }
            }
            else
            {
                red2 = 0;
            }

            ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            ctx.fillStyle = "rgb(0,255,0)";
            ctx.fillRect(1, this.canvas.height - green1, 8, green1);
            ctx.fillRect(11, this.canvas.height - green2, 8, green2);
            ctx.fillStyle = "rgb(255,0,0)";
            ctx.fillRect(1, this.canvas.height - green1 - red1, 8, red1);
            ctx.fillRect(11, this.canvas.height - green2 - red2, 8, red2);
            
            window.requestAnimationFrame(animate);
        }

        animate();

    }
}

customElements.define("audio-channel", AudioChannel);