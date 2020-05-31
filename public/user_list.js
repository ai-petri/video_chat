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

    deleteById(id)
    {
        this.users.forEach(user=>
        {
            if(user.id == id)
            {
                this.delete(user);
            }
        });
    }

    getUserById(id)
    {
        return Array.from(this.users).find(user=>user.id == id);
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
            <img src="${user.image? user.image : 'default_icon.svg'}">
            <input type="checkbox">
            `
            if(user == selected)
            {
                item.classList.add("selected");
            }
            item.querySelector("img").onclick = e => 
            {
                this.selected = user;
                
                this.items.forEach(el=>el.classList.remove("selected"));                        
                item.classList.add("selected");
                this.updateList();
                this.dispatchEvent(new Event("selected"))
            }
            item.querySelector("input[type=checkbox]").onclick = e =>
            {
                
            }

            this.items.push(item);
        });

       this.updateList();
    }

    updateList()
    {
        
        this.ul.innerHTML = "";
        for(let i=0; i<this.capacity & i<this.items.length; i++)
        {   

            let n = i + this.itemOffset;
            while(n>this.items.length - 1)
            {
                n -= this.items.length;
            }
            while(n<0)
            {
                n += this.items.length;
            }
               
            this.ul.appendChild(this.items[n]);
                  
        }

    }

    showNext()
    {        
        this.itemOffset += 1;
        this.updateList();
    }

    showPrevious()
    {       
        this.itemOffset -= 1;
        this.updateList();
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
                margin: 0;
                position: absolute; 
            }
            input[type=checkbox]:checked
		    {
                opacity: 1;
		    }
            img
            {
                height: 40px;
                width: 40px; 
                object-fit: cover;
                border-radius: 50%;
            }        
            ul
            {
                list-style-type: none;
                margin: 0;
                padding: 0;
                margin-bottom: 15px;
                display: inline-block;
                vertical-align: middle;
                width:70%;
                height: 40px;
            }
            li
            {
                cursor: pointer;
                display: inline-block;
                margin: 0px;
                padding: 10px;
                border: 1px solid rgba(0,0,0,0);
            }
            li:hover > input[type=checkbox]
            {
                opacity: 1;
            }
            button
            {
                display: inline-block;
                width: 10%;
                background-color: rgba(0,0,0,0);
                border: none;
                margin: 0;
                cursor:pointer;
            }
            .selected
            {
                background: lightgrey;
            }
        </style>


        <button onclick="this.parentNode.host.showPrevious()">◄</button>
        <ul></ul>
        <button onclick="this.parentNode.host.showNext()">►</button>
        
        `
        this.ul = shadow.querySelector("ul");
    }
}

customElements.define("user-list", UserList);