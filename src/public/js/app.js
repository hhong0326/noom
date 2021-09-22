// find socket.io automatically
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(msg) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}

function handleMsgSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
        
    });
    input.value = "";
}

function showRoom(roomN) {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomN} ${roomName}`;

    const form = room.querySelector("form");
    form.addEventListener("submit", handleMsgSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();

    const input = form.querySelector("input");
    // send -> emit
    // any event(type)
    // emit room event or any event
    // ex) socket.io can emit objects
    // can emit multiple arguments
    // Last argument can be callback function (server can exec front-end function)
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
    addMessage("Someone joined!");
});

socket.on("bye", () => {
    addMessage("Someone left ㅠㅠ");
}); 

socket.on("new_message", addMessage);
