const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080, clientTracking: true });
const uuid = require("uuid");

// room:
// id
// clients

class Room {
  /**
   *
   * @param {string} code
   * @param {WebSocket} sender
   */
  constructor(code, sender) {
    this.code = code;
    this.sender = sender;
  }

  /**
   * @param {WebSocket} socket
   */
  addReceiver(socket) {
    if (this.receiver) return;
    this.receiver = socket;
  }
}

wss.broadcast = (message) => {
  wss.clients.forEach((client) => {
    client.send(message);
  });
};

let rooms = new Map();

wss.on("connection", (socket) => {
  console.log("client connected");
  socket.on("message", (data) => {
    const { name, body } = JSON.parse(data);
    switch (name) {
      case "get-code":
        let code = uuid.v4();
        while (rooms.get(code)) {
          code = uuid.v4();
        }
        let res = {
          name: "get-code",
          body: {
            code: code,
          },
        };
        rooms.set(code, new Room(code, socket));
        socket.send(JSON.stringify(res));
        break;
      case "join-room":
        socket.send(handleJoinRoom(body, socket));
        break;
      case "sender-ready":
        socket.send(handleSenderReady(body));
      default:
        break;
    }
  });
});

function handleJoinRoom(body, socket) {
  let res;
  const { code } = body;
  const room = rooms.get(code);
  if (room) {
    room.addReceiver(socket);
    res = {
      name: "receiver-ready",
      body: {
        // code: room.code,
      },
    };
    room.sender.send(JSON.stringify(res));
    return "{}";
  } else {
    res = {
      name: "error-message",
      body: {
        message: "Invalid code",
      },
    };
  }
  return JSON.stringify(res);
}

function handleSenderReady(body) {
  let res;
  const { code } = body;
  const room = rooms.get(code);
  if (room) {
    res = {
      name: "sender-ready",
      body: {},
    };
    if (room.receiver) {
      room.receiver.send(JSON.stringify(res));
      return "{}";
    }
  } //do something
  else {
    res = {
      name: "error-message",
      body: {
        message: "Invalid code",
      },
    };
  }
  return JSON.stringify(res);
}
