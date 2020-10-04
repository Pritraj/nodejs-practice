const http = require("http");
const WebSocketServer = require("websocket").server;

// To host index.html
const app = require("express")();
app.get("/", (req,res)=> res.sendFile(__dirname + "/client.html"));
app.listen(8081, () => console.log(`Listening http://localhost:8081`))


// to start web server
const httpServer = http.createServer((req, res) => {
    console.log("Request Received");
});
httpServer.listen(8080, () => console.log(`Listening websocket on ${httpServer.address().port}`))

// wire up socket server
const clients = {};
const games = {};
let connection;
const webSocket = new WebSocketServer({ "httpServer": httpServer });
webSocket.on("request", request => {
    // connect
    connection = request.accept(null, request.origin);

    connection.on("open", e => console.log("Opened!!"));
    connection.on("close", e => console.log("Closed!!"));

    connection.on("message", message => {

        let result = JSON.parse(message.utf8Data);
        if(result.method == "create"){
            const clientId = result.clientId;
            const gameId = uuidv4();

            games[gameId] = {id:gameId, balls:20, clients:[]}

            const payLoad = {method:"create", game:games[gameId]}
            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));
        }

        if(result.method == "join"){
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];
            if(game.clients.length >= 3){
                return;
            } 
            const color = {0:"Red", 1:"Green", 2:"Blue"}[game.clients.length];
            game.clients.push({clientId:clientId,color:color});

            let payLoad = {method:"join", game:game};
            game.clients.forEach(element => {
                clients[element.clientId].connection.send(JSON.stringify(payLoad));
            });
        }

        if(result.method == "play"){
            const clientId = result.clientId;
            const gameId = result.gameId;
            const ballId = result.ballId;
            const color = result.color;

            let state = games[gameId].state;
            if(!state)
                state = {};

            state[ballId] = color;
            games[gameId].state = state;

            const game = games[gameId];
            game.clients.forEach(c => {
                let con = clients[c.clientId].connection;
                let payLoad = {method:"update", game:game}
                con.send(JSON.stringify(payLoad));

            });
        }
    });

    // generate a new client id
    const clientId = uuidv4();
    clients[clientId] = {connection:connection};

    const payLoad = {
        "method":"connect",
        "clientId":clientId
    }
    // send back the client
    connection.send(JSON.stringify(payLoad));

});


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


