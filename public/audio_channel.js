class SimpleKnob extends HTMLElement
	{
		constructor()
		{
			super();

			this.angle = 0;
		}

		get value()
		{
			return this.angle/120.0;
		}

        mouseUpHandler = e =>
        {
            this.isDown = false;
            this.y = 0;
        }

        mouseMoveHandler = e =>
        {
            if(this.isDown)
				{
					let dy = e.clientY - this.y;
					let angle = this.angle - dy;
					if(angle>-120 && angle<120)
					{
						this.angle = angle;
						this.shadowRoot.children[0].style.transform = `rotate(${this.angle}deg)`;
						this.dispatchEvent(new Event("input"))
					}
					
				}
        }
		connectedCallback()
		{
			let root = this.attachShadow({mode: "open"});
			root.innerHTML =
			
			`
			<svg width="20px" height="20px" style="transform:rotate(0deg); display:block">
			<circle r="8" cx="10" cy="10" stroke="rgb(0,0,0)" fill="rgba(0,0,0,0)" stroke-width="2"></circle>
			<line x1="10" y1="10" x2="10" y2="2" stroke="rgb(0,0,0)" stroke-width="1"></line>
			</svg>`

			
			this.onmousedown = e =>
			{
				this.isDown = true;
				this.y = e.clientY;
            }
            
            this.onwheel = e =>
            {
                e.preventDefault();
                
                let angle = this.angle - e.deltaY;
                if(angle>-120 && angle<120)
                {
                    this.angle = angle;
                    this.shadowRoot.children[0].style.transform = `rotate(${this.angle}deg)`;
                    this.dispatchEvent(new Event("input"));
                }               
            }
            this.ondblclick = e =>
            {
                this.angle = 0;
                this.shadowRoot.children[0].style.transform = `rotate(${this.angle}deg)`;
                this.dispatchEvent(new Event("input"));
            }
			addEventListener("mouseup", this.mouseUpHandler);
			addEventListener("mousemove", this.mouseMoveHandler);
        }
        
        disconnectedCallback()
        {
            removeEventListener("mouseup", this.mouseUpHandler);
			removeEventListener("mousemove", this.mouseMoveHandler);
        }
		
	}

	customElements.define("simple-knob", SimpleKnob);



class AudioChannel extends HTMLElement
{

    canvas = document.createElement("canvas");
    
    input = document.createElement("input");

    knob = new SimpleKnob();

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

        this.panner = this.audioContext.createStereoPanner();        
        this.gain = this.audioContext.createGain();
        this.panner.connect(this.gain);
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
        source.connect(this.panner);                     
    }
    
    addTrack(track)
    {
        var source = this.audioContext.createMediaStreamTrackSource(track);
        source.connect(this.panner);
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
           height: 100px;
           margin-top: 10px;
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
        this.knob.oninput = e =>
        {
            this.panner.pan.setValueAtTime(this.knob.value, this.audioContext.currentTime);
        }
        shadow.appendChild(this.knob);
        

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