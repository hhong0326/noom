import http from "http";
import WebSocket from "ws";
import express from "express"; 

const app = express();

// express
// setting views
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// frond-end part (user only can watch)
app.use("/public", express.static(__dirname + "/public"));

// rendering home
app.get("/", (req, res) => res.render("home"));

//catch unnormal url
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// for http + ws 
const server = http.createServer(app);

// it sends var server to wss server, 
// same server(port) with 2 protocol(http, ws)
// connection
const wss = new WebSocket.Server({ server });

// temp db
const sockets = [];

// event listen for wss server
// socket = browser
wss.on("connection", (socket) => {
    sockets.push(socket);
    // get in first
    socket["nickname"] = "Anon";
    console.log("Connect to Browser ✅");
    
    // socket event, not server
    // each browser who connected server
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    socket.on("message", (message) => {
        const translatedMessageData = message.toString('utf8');
        const msg = JSON.parse(translatedMessageData);
        
        switch (msg.type) {
            case "new_message":
                sockets.forEach(s => {
                    s.send(`${socket.nickname}: ${msg.payload}`);
                });
                break;
            case "nickname":
                //bcz socket is object, can save new variable(data)
                socket["nickname"] = msg.payload;
                break;        
        }
    });
})

server.listen(3000, handleListen);