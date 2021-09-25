import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";
import express from "express"; 
import { instrument } from "@socket.io/admin-ui";

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
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);
instrument(wsServer, {
    auth: false,
});

function publicRooms() {
    // const sids = wsServer.sockets.adapter.sids;
    // const rooms = wsServer.sockets.adapter.rooms;
    const { sockets: { adapter: { sids, rooms }}} = wsServer;

    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    // console.log(socket);
    // any event listen middleware
    

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (nickName, roomName, done) => {
        socket["nickname"] = nickName;
        // room feature
        socket.join(roomName);
        // console.log(socket.rooms);
        done(countRoom(roomName));
        // send msg everybody in the room except myself
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        // setTimeout(() => {
        //     // Server execs front-end's callback function in browser
        //     done("hello");
        // }, 10000); 

        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1))
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message", (msg, room, done) => {
        
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });

    socket.on("nickname", (nickname) => socket["nickname"] = nickname );
    
});

// it sends var server to wss server, 
// same server(port) with 2 protocol(http, ws)
// connection
// const wss = new WebSocket.Server({ server });

// // temp db
// const sockets = [];

// // event listen for wss server
// // socket = browser
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     // get in first
//     socket["nickname"] = "Anon";
//     console.log("Connect to Browser ✅");
    
//     // socket event, not server
//     // each browser who connected server
//     socket.on("close", () => console.log("Disconnected from the Browser ❌"));
//     socket.on("message", (message) => {
//         const translatedMessageData = message.toString('utf8');
//         const msg = JSON.parse(translatedMessageData);
        
//         switch (msg.type) {
//             case "new_message":
//                 sockets.forEach(s => {
//                     s.send(`${socket.nickname}: ${msg.payload}`);
//                 });
//                 break;
//             case "nickname":
//                 //bcz socket is object, can save new variable(data)
//                 socket["nickname"] = msg.payload;
//                 break;        
//         }
//     });
// })

httpServer.listen(3000, handleListen);