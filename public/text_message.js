class TextMessage extends HTMLElement
{
    constructor(message)
    {
        super();
        this.from = message.from;
        this.data = message.data;
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
           ${this.from}: ${this.data}
        `
    }
}

customElements.define("text-message", TextMessage)