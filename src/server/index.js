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
      case "change-status":
        handleChangeStatusEvent(body, socket);
        break;
      case "upload-files":
        handleUploadFilesEvent(body, socket);
        break;
      case "get-file":
        handleGetFileEvent(body, socket);
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

const handleUploadFilesEvent = (body, socket) => {
  const { code, response } = body;
  const bucket = buckets.get(code);
  let res;
  if (!bucket) {
    res = generateSocketMessage("error-message", {
      message: "Invalid bucket - Bucket was not found",
    });
    socket.send(res);
    return;
  }
  if (response.error) {
    res = generateSocketMessage("error-message", {
      message: `Upload error - File could not be uploaded (${bytes.error})`,
    });
    socket.send(res);
    return;
  }

  bucket.uploadFile(response.bytes, response.name);
  bucket.updateStatus(T_READY); // socket response gets sent in the method itself
  console.log(bucket.T_RES, bucket.T_STRUCT);
  return;
};

const handleChangeStatusEvent = (body, socket) => {
  const { code, status } = body;
  const bucket = buckets.get(code);
  let res;
  if (!bucket) {
    res = generateSocketMessage("error-message", {
      message: "Invalid bucket - Bucket was not found",
    });
    socket.send(res);
    return;
  }
  bucket.updateStatus(status); // socket response gets sent in the method itself
  return;
};

const handleGetFileEvent = (body, socket) => {
  const { code } = body;
  const bucket = buckets.get(code);
  let res;
  if (!bucket) {
    res = generateSocketMessage("error-message", {
      message: "Invalid bucket - Bucket was not found",
    });
    socket.send(res);
    return;
  }
  res = generateSocketMessage("file-gotten", {
    file: bucket.file,
  });
  socket.send(res);
  return;
};

console.log("WebSocket server listening on 8080");
