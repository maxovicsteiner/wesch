// The contents of this file are responsible for the webRTC based p2p file sharing feature
const ws = new WebSocket("ws://localhost:8080");

let receiverReady = false,
  senderReady = false,
  offerCreated = false,
  rtcPeerConnection;

ws.onmessage = handleRespone;

const iceServers = {
  iceServer: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

function handleRespone({ data }) {
  if (data.toString() === "{}") return;
  const { name, body } = JSON.parse(data);
  switch (name) {
    case "get-code":
      handleGetCode(body);
      break;
    case "receiver-ready":
      handleReceiverReady();
      break;
    case "sender-ready":
      handleSenderReady();
      break;
    case "error-message":
      handleErrorMessage(body);
      break;
    case "candidate":
      handleCandidate(body);
      break;
    case "offer":
      createAnswer(body);
      break;
    case "answer":
      handleAnswer(body);
    default:
      break;
  }
}

ws.onopen = () => {
  if (role_choice === "Sender") {
    const data = {
      name: "get-code",
      body: {},
    };
    ws.send(JSON.stringify(data));
  }
};

btnTransferFile.onclick = (e) => {
  e.preventDefault();
  if (role_choice === "Sender") {
    if (filePathInput.value.trim() === "") return;
    const data = {
      name: "sender-ready",
      body: {
        code: code,
      },
    };
    ws.send(JSON.stringify(data));
  } else if (role_choice === "Receiver") {
    const data = {
      name: "join-room",
      body: {
        code: roomId.value,
      },
    };
    ws.send(JSON.stringify(data));
  }
};

function handleGetCode(body) {
  const { code: _code } = body;
  roomId.value = _code;
  // the next line works i dont know why do not fucking remove it
  code = _code;
}

function handleReceiverReady() {
  receiverReady = true;
  if (senderReady) createOffer();
}

function handleSenderReady() {
  senderReady = true;
  if (receiverReady) {
    let res = {
      name: "join-room",
      body: {
        code: code,
      },
    };
    ws.send(JSON.stringify(res));
  }
}

function createOffer() {
  if (offerCreated) return;
  offerCreated = true;
  rtcPeerConnection = new RTCPeerConnection(iceServers);
  rtcPeerConnection.onicecandidate = iceCandidateHandler;
  rtcPeerConnection
    .createOffer()
    .then((sessionDescription) => {
      rtcPeerConnection.setLocalDescription(sessionDescription);
      const data = {
        name: "offer",
        body: {
          sdp: sessionDescription,
          room: roomId.value,
        },
      };
      ws.send(JSON.stringify(data));
      console.log("offer created");
    })
    .catch((err) => {
      console.log(err.message);
    });
}

function createAnswer({ sdp }) {
  rtcPeerConnection = new RTCPeerConnection(iceServers);
  rtcPeerConnection.onicecandidate = iceCandidateHandler;
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
  rtcPeerConnection
    .createAnswer()
    .then((sessionDescription) => {
      rtcPeerConnection.setLocalDescription(sessionDescription);
      const data = {
        name: "answer",
        body: {
          sdp: sessionDescription,
          room: roomId.value,
        },
      };
      ws.send(JSON.stringify(data));
      console.log("answer created");
    })
    .catch((err) => {
      console.log(err.message);
    });
}

function handleErrorMessage(body) {
  const { message } = body;
  alert("Error: " + message);
}

function iceCandidateHandler({ candidate }) {
  if (candidate) {
    console.log(candidate);
    let data = {
      name: "candidate",
      body: {
        label: candidate.sdpMLineIndex,
        id: candidate.sdpMid,
        candidate: candidate.candidate,
        emitter: role_choice,
        room: roomId.value,
      },
    };
    ws.send(JSON.stringify(data));
  }
}

function handleCandidate(body) {
  const candidate = new RTCIceCandidate({
    sdpMLineIndex: body.label,
    candidate: body.candidate,
  });

  rtcPeerConnection.addIceCandidate(candidate);
}

function handleAnswer({ sdp }) {
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
  console.log("thats it, its done");
}
