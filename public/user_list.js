class UserList extends HTMLElement
{
    
    constructor()
    {
        super();
    }

    users = new Set();
    selected;

    items = [];
    itemOffset = 0;
    capacity = 5;

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

    

    getUserById(id)
    {
        for (let u of this.users)
        {
            if(u.id === id)
            {
                return u;
            }
        }
    }

    getIds()
    {
        return  Array.from(this.users).map(user=>user.id);
    }


    update()
    {
        this.items = [];
        this.users.forEach(user=>
        {
            let item = document.createElement("li");
            item.innerHTML =
            `
            <input type="checkbox">
            <img src="${user.image? user.image : 'default_icon.svg'}">
            ${user.name}

            `
            if(user == selected)
            {
                item.classList.add("selected");
            }
            item.onclick = e => 
            {
                if (this.selected === user) return;
                
                this.selected = user;
                
                this.items.forEach(el=>el.classList.remove("selected"));                        
                item.classList.add("selected");
                this.updateList();
                this.dispatchEvent(new Event("selected"))
            }
            let checkbox = item.querySelector("input[type=checkbox]");
            if(user.connection.iceConnectionState !== "new")
            {
                checkbox.checked = true;
            }
            let timer;
            checkbox.onclick = e =>
            {
                if(checkbox.checked)
                {
                    user.connect();
                    checkbox.disabled = true;
                    timer = setTimeout(() => {
                        user.disconnect();
                    }, 2000);
                }
                else
                {
                    user.disconnect();
                }     
            }
            user.addEventListener("connected", e=>
            {
                clearTimeout(timer);
                checkbox.checked = true;
                checkbox.disabled = false;
            })
            user.addEventListener("disconnected", e=>
            {
                clearTimeout(timer);
                checkbox.checked = false;
                checkbox.disabled = false;
            })

            this.items.push(item);
        });

       this.updateList();
    }

    updateList()
    {
        
        this.ul.innerHTML = "";
        for(let i=0; i<this.items.length; i++)
        {   
            this.ul.appendChild(this.items[i]);                 
        }
    }

    connectedCallback()
    {
        var shadow = this.attachShadow({mode:"open"});
        shadow.innerHTML = 
        `
        <style>

            input[type=checkbox]
		    {
                opacity: 0;
                margin: -5px;
                vertical-align: top;               
            }
            input[type=checkbox]:checked
		    {
                opacity: 1;
		    }
            img
            {
                height: 25px;
                width: 25px; 
                
                object-fit: cover;
                border-radius: 50%;
                vertical-align: middle;
            }        
            ul
            {
                list-style-type: none;
                margin: 0;
                padding: 0;
                vertical-align: middle;
            }
            li
            {
                cursor: pointer;
                padding: 10px 30px 10px 10px;
                color: grey;
            }
            li:hover > input[type=checkbox]
            {
                opacity: 1;
            }
            .selected
            {
                background: lightgrey;
                color: black;
            }
        </style>
        <ul></ul>
        `
        this.ul = shadow.querySelector("ul");
    }
}

customElements.define("user-list", UserList);