class User
{
    id = new Date().getTime();
    name = "anonymous";
    image;
    connection;
    constructor(connection)
    {
        this.connection = connection;
    }

    get info()
    {
        return JSON.stringify({ id: this.id, name: this.name, image: this.image });
    }
}

module.exports = {User};