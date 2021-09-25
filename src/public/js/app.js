const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOn = false;
let roomName;
let myPeerConnection;

async function getMedia(deviceId) {
    const initialConstraints = {
        audio: true,
        video: {
            facingMode: "user",
        },
    };
    const cameraConstraints = {
        audio: true,
        video: {
            deviceId: { exact: deviceId },
        },
    };
    
    try {
        
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        );     
        myFace.srcObject = myStream;
        
        if (!deviceId) {
            await getCameras();
        }
            
    } catch(e) {
        console.log(e);
    }
}
    
async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            
            camerasSelect.appendChild(option);
        });
    } catch(e) {
        console.log(e);
    }
}

function handleMuteClick() {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick() {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    if (!cameraOn) {
        cameraBtn.innerText = "Turn Camera On";
        cameraOn = true;
    } else {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOn = false;
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();

    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    //save roomName for local
    roomName = input.value;
    input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// host
socket.on("welcome", async () => {
    // trigger to be able to do webRTC process
    // offer
    console.log("Someone joined");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("send the offer");
    socket.emit("offer", offer, roomName);
});

// guest
socket.on("offer", (offer) => {
    // answer
    console.log(offer);
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
});

// host
socket.on("answer", (answer) => {
    myPeerConnection.setRemoteDescription(answer);
});

// RTC Code

// addStream()
function makeConnection() {
    // be able to access anyone
    myPeerConnection = new RTCPeerConnection();
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}