class TextMessage extends HTMLElement
{
    constructor(user, data)
    {
        super();
        this.user = user;
        this.data = data;
        this.date = new Date();
    }
    
    connectedCallback()
    {
        var shadow = this.attachShadow({mode:"open"});

        shadow.innerHTML = 
        `
        <style>
        :host
        {
            display: block;
        }
        </style>
        <span style="color:blue;">
           [${("0" + this.date.getHours()).slice(-2)}:${("0" + this.date.getMinutes()).slice(-2)}]<b> ${this.user.name} :</b> 
           </span>
            ${this.data}
            <br><br>
        `
    }
}

customElements.define("text-message", TextMessage)