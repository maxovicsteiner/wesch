// The contents of this file are responsible for the webRTC based p2p file sharing feature
const ws = new WebSocket("ws://localhost:8080");

let receiverReady = false,
  senderReady = false,
  rtcPeerConnection;

ws.onmessage = handleRespone;

const iceServer = {
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
  console.log("offer created");
}

function handleErrorMessage(body) {
  const { message } = body;
  alert("Error: " + message);
}
