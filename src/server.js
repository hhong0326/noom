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

// event listen for wss server
// socket = browser
wss.on("connection", (socket) => {
    console.log("Connect to Browser ✅");
    // socket event, not server
    // each browser who connected server
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    socket.on("message", (message) => {
        const translatedMessageData = message.toString('utf8');
        console.log(translatedMessageData);
    });
    socket.send("hello!");
})

server.listen(3000, handleListen);