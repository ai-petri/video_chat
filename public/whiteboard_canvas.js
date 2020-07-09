class WhiteboardCanvas extends HTMLCanvasElement
{
    x = 0;
	y = 0;
	

    isDown = false;
    n = 0;



	constructor()
	{
		super();
		this.width = 1600;
		this.height = 300;
		this.context = this.getContext("2d");
	}
	
	paint(n,x,y)
	{
		if(n===0)
		{
			this.context.moveTo(x,y);
			this.context.beginPath();
		}
		else
		{
			this.context.lineTo(x,y);
			this.context.stroke();
		}					
	}

    connectedCallback()
    {
		
		
		this.context.strokeStyle = "#000000";

		
		this.addEventListener("mousedown", e =>
		{
			this.isDown = true;
			this.n = 0;
			

		});
		this.addEventListener("touchstart", e =>
		{
			this.isDown = true;
			this.n = 0;			
			
		});
	
		this.addEventListener("mouseup", e => {this.isDown = false; this.n = 0;});
		this.addEventListener("touchend", e => {this.isDown = false; this.n = 0;});

		this.addEventListener("mousemove", e =>
		{
			if (this.isDown)
			{
				let x = e.clientX - this.getBoundingClientRect().x ;
				let y = e.clientY - this.getBoundingClientRect().y;
				
				let data = 
				{
					n: this.n,
					x: x,
					y: y
				}
                
				this.dispatchEvent(new CustomEvent("point", {detail: data}));
				this.paint(this.n,x,y);
				this.n++;
				
			}
		});
		this.addEventListener("touchmove", e =>
		{
			if (this.isDown)
			{
				let x = e.touches[0].clientX - this.getBoundingClientRect().x;
				let y = e.touches[0].clientY - this.getBoundingClientRect().y;
				let data = 
				{
					n: this.n,
					x: x,
					y: y
				}
                
				this.dispatchEvent(new CustomEvent("point", {detail: data}));

				this.paint(this.n,x,y);
				
				this.n++;
			}
		});
    }
}


customElements.define("whiteboard-canvas", WhiteboardCanvas, {extends: 'canvas'})