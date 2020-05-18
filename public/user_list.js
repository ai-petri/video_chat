class UserList extends HTMLElement
{
    
    constructor()
    {
        super();
    }

    users = new Set();
    selected;

    add(user)
    {
        this.users.add(user);
        this.update()
    }

    delete(user)
    {
        this.users.delete(user);
        if(this.selected == user)
        {
            this.selected = "";
            this.dispatchEvent(new Event("deselected"));
        }
        this.update();
    }

    has(user)
    {
        return Array.from(this.users).map(user=>user.id).includes(user.id);
    }

    deleteById(id)
    {
        console.log("del "+ id);
        this.users.forEach(user=>
        {
            if(user.id == id)
            {
                this.delete(user);
            }
        })
    }

    update()
    {
        var ul = this.shadowRoot.querySelector("ul");
        ul.innerHTML = "";

        this.users.forEach(user=>
        {
            let item = document.createElement("li");
            item.innerHTML = user.name;
            if(user == selected)
            {
                item.classList.add("selected");
            }
            item.onclick = e => 
            {
                this.selected = user;
                ul.childNodes.forEach(c=>c.classList.remove("selected"));
                e.target.classList.add("selected");
                this.dispatchEvent(new Event("selected"))
            }
            ul.appendChild(item);
        });
    }

   

    connectedCallback()
    {
        var shadow = this.attachShadow({mode:"open"});

        shadow.innerHTML = 
        `
        <style>
            ul
            {
                list-style-type: none;                
            }
            li
            {
                cursor: pointer;
            }
            .selected
            {
                color:red;
            }
        </style>

        <ul></ul>
        `
    }
}

customElements.define("user-list", UserList);