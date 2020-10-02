const http = require("http");
const WebSocketServer = require("websocket").server;
let connection;
const httpServer = http.createServer((req, res)=>{
    console.log("Request Received");
});

const webSocket = new WebSocketServer({"httpServer":httpServer});

webSocket.on("request", request=>{
    connection = request.accept(null, request.origin);
    connection.on("resume", e=>console.log("Resumed!!"));
    connection.on("close", e=>console.log("Closed!!"));
    connection.on("message", message=>{
        console.log(`Received message from client: ${message.utf8Data}`);
    });
    sendEvery5Sec();
});

function sendEvery5Sec(params) {
    connection.send(`Message ${Math.random()}`)
    setTimeout(sendEvery5Sec, 5000);
}

httpServer.listen(8080, ()=> console.log(`Listening on ${httpServer.address().port}`))