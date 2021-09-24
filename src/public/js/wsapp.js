const msgList = document.querySelector("ul");
const msgForm = document.querySelector("#msg");
const msgNickForm = document.querySelector("#nick");

const socket = new WebSocket(`ws://${window.location.host}`);

function makeMsg(type, payload) {
    const msg = {type, payload}
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connected to Server ✅")
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    msgList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌")
});

function handleSubmit(event) {
    event.preventDefault();

    const input = msgForm.querySelector("input");
    // console.log(input.value);
    socket.send(makeMsg("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    msgList.append(li);
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();

    // different form
    const input = msgNickForm.querySelector("input");
    // JSON.stringify(input.value)
    socket.send(makeMsg("nickname", input.value));
    input.value = "";
}

msgForm.addEventListener("submit", handleSubmit);
msgNickForm.addEventListener("submit", handleNickSubmit);