const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080, clientTracking: true });
const uuid = require("uuid");
const { generateSocketMessage } = require("../utils/generateSocketMessage");
const { Bucket, T_OPEN, T_READY, T_UPLOADING } = require("../classes/Bucket");
const fs = require("fs");
const util = require("util");

const getFileBytes = util.promisify(fs.readFile);

let usedCodes = new Set();
let buckets = new Map();

wss.on("connection", (socket) => {
  console.log("client connected");
  socket.on("message", (data) => {
    const { name, body } = JSON.parse(data);
    switch (name) {
      case "get-code":
        handleGetCodeEvent(body, socket);
        break;
      case "create-bucket":
        handleCreateBucketEvent(body, socket);
        break;
      case "join-bucket":
        handleJoinBucketEvent(body, socket);
        break;
      case "upload-files":
        handleUploadFilesEvent(body, socket);
        break;
      default:
        break;
    }
  });
});

const handleGetCodeEvent = (_body, socket) => {
  let code = uuid.v4();
  while (buckets.get(code) || usedCodes.has(code)) {
    code = uuid.v4();
  }
  usedCodes.add(code);
  let res = generateSocketMessage("get-code", { code });
  socket.send(res);
};

const handleCreateBucketEvent = (body, socket) => {
  const { code } = body;
  const bucket = new Bucket(code, socket);
  buckets.set(code, bucket);
  usedCodes.delete(code);
  let res = generateSocketMessage("bucket-created", { code });
  socket.send(res);
};

const handleJoinBucketEvent = (body, socket) => {
  const { code } = body;
  const bucket = buckets.get(code);
  let res;
  if (!bucket) {
    res = generateSocketMessage("error-message", {
      message: "Invalid code - Bucket hasn't been created yet",
    });
    socket.send(res);
    return;
  }
  bucket.addReceiver(socket);
  res = generateSocketMessage("joined-bucket", { status: bucket.T_STATUS });
  socket.send(res);
};

const handleUploadFilesEvent = async (body, socket) => {
  const { code, file } = body;
  let res;
  if (!file) {
    res = generateSocketMessage("error-message", {
      message: "Invalid file - Please enter the file path before uploading",
    });
    socket.send(res);
    return;
  }
  const bucket = buckets.get(code);
  if (!bucket) {
    res = generateSocketMessage("error-message", {
      message: "Invalid bucket - An error happened please try again later",
    });
    socket.send(res);
    return;
  }
  if (!fs.existsSync(file)) {
    res = generateSocketMessage("error-message", {
      message: "Invalid file - No file has been found at the given path",
    });
    socket.send(res);
    return;
  }
  bucket.updateStatus(T_UPLOADING);
  try {
    const bytes = await getFileBytes(file);
    bucket.updateStatus(T_READY);
    bucket.uploadFile(bytes);
    res = generateSocketMessage("file-uploaded", {
      result: bucket.T_RES,
    });
    socket.send(res);
    return;
  } catch (error) {
    bucket.updateStatus(T_OPEN);
    res = generateSocketMessage("error-message", {
      message: `Invalid file - Could not read file (${error.message})`,
    });
    socket.send(res);
    return;
  }
};

console.log("WebSocket server listening on 8080");
