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
    if (myPeerConnection) {
        // new Track from getMedia
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find((sender) => sender.track.kind === "video");
        
        // sender is controller deals with the sent data of the other browser
        videoSender.replaceTrack(videoTrack);
    }
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
    socket.emit("offer", offer, roomName);
    console.log("sent the offer");
});

// guest
socket.on("offer", async (offer) => {
    // answer
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
});

// host
socket.on("answer", (answer) => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});

// RTC Code

// addStream()
function makeConnection() {
    // be able to access anyone
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [ // STUN server test
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    // each other
    socket.emit("ice", data.candidate, roomName);
    console.log("sent candidate");
}

function handleAddStream(data) {
    console.log("got an event from my peer");
    console.log(data.stream);
    console.log("my\n", myStream);

    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}