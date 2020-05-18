class User
{
    id = new Date().getTime();
    name = "anonymous";
    connection;
    constructor(connection)
    {
        this.connection = connection;
    }

    get info()
    {
        return JSON.stringify({ id: this.id, name: this.name });
    }
}

module.exports = {User};