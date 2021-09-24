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
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
        
    });
    input.value = "";
}

function handleNickNameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#nick input");
    const value = input.value;
    socket.emit("nickname", value);
}

function showRoom(newCount) {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName} (${newCount})`;

    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#nick");
    msgForm.addEventListener("submit", handleMsgSubmit);
    nameForm.addEventListener("submit", handleNickNameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();

    const nickInput = form.querySelector("#nick");
    const roomInput = form.querySelector("#name");
    
    // send -> emit
    // any event(type)
    // emit room event or any event
    // ex) socket.io can emit objects
    // can emit multiple arguments
    // Last argument can be callback function (server can exec front-end function)
    socket.emit("enter_room", nickInput.value, roomInput.value, showRoom);
    roomName = roomInput.value;
    const presentNick = room.querySelector("#nick input");
    presentNick.value = nickInput.value;
    nickInput.value = "";
    roomInput.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName} (${newCount})`;

    addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName} (${newCount})`;

    addMessage(`${left} left ㅠㅠ`);
}); 

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.appendChild(li);
    })
});