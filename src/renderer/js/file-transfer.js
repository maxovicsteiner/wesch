"use strict";

const T_UPLOADING = "T_UPLOADING";
const T_READY = "T_READY";

// The contents of this file are responsible for the webRTC based p2p file sharing feature
const ws = new WebSocket("ws://localhost:8080");

/**
 *
 * @param {string} name
 * @param {any} body
 * @returns string
 */
function generateSocketMessage(name, body) {
  return JSON.stringify({
    name,
    body,
  });
}

/**
 *
 * @param {string} val
 */
function lockRoleChoice(val) {
  roleRadioButtons.forEach((button) => {
    if (button.value !== val) button.setAttribute("disabled", true);
  });
}

let previousErrorTimeout = null;
/**
 *
 * @param {string} message
 */
function displayError(message) {
  errorMessage.innerText = message;
  if (previousErrorTimeout) clearTimeout(previousErrorTimeout);
  const currentTimeout = setTimeout(() => {
    errorMessage.innerText = "";
    actionButton.removeAttribute("disabled");
    if (previousErrorTimeout === currentTimeout) previousErrorTimeout = null;
  }, 3000);
  previousErrorTimeout = currentTimeout;
}

ws.onmessage = handleResponse;

ws.onopen = () => {
  let req = generateSocketMessage("get-code", {});
  ws.send(req);
};

function handleResponse({ data }) {
  if (data.toString() === "{}") return;
  const { name, body } = JSON.parse(data);
  switch (name) {
    case "get-code":
      handleGetCodeEvent(body);
      break;
    case "bucket-created":
      handleBucketCreatedEvent(body);
      break;
    case "joined-bucket":
      handleJoinedBucketEvent(body);
      break;
    case "file-uploaded":
      handleFileUploadedEvent(body);
      break;
    case "status-updated":
      handleStatusUpdatedEvent(body);
      break;
    case "file-gotten":
      handleFileGottenEvent(body);
      break;
    case "error-message":
      handleErrorMessage(body);
      break;
    default:
      break;
  }
}

actionButton.onclick = async (e) => {
  e.preventDefault();
  let req;
  switch (e.target.innerText) {
    case "Create bucket":
      req = generateSocketMessage("create-bucket", { code });
      actionButton.setAttribute("disabled", true);
      // actionButton.innerText = "Creating...";
      break;
    case "Inspect bucket":
      req = generateSocketMessage("join-bucket", { code: bucket_id.value });
      actionButton.setAttribute("disabled", true);
      // actionButton.innerText = "Joining...";
      break;
    case "Upload file(s)":
      req = generateSocketMessage("change-status", {
        code,
        status: T_UPLOADING,
      });
      ws.send(req);
      const response = await fs.getFileBytes(filePathInput.value.trim());
      req = generateSocketMessage("upload-files", {
        code,
        response,
      });
      actionButton.setAttribute("disabled", true);
      // actionButton.innerText = "Uploading...";
      break;
    default:
      break;
  }
  if (req) ws.send(req);
};

const handleGetCodeEvent = ({ code: _code }) => {
  bucket_id.value = _code;
  code = _code; // ignore warning
};

const handleBucketCreatedEvent = () => {
  lockRoleChoice("Sender");
  display("upload");
};

const handleJoinedBucketEvent = (body) => {
  const { status } = body;
  lockRoleChoice("Receiver");
  display("download");
  changeStatusPlaceholder(status);
};

const handleFileUploadedEvent = (body) => {
  console.log(body.result);
};

const handleStatusUpdatedEvent = (body) => {
  const { status } = body;
  changeStatusPlaceholder(status);
  if (status === T_READY) {
    let req = generateSocketMessage("get-file", { code });
    ws.send(req);
  }
};

const handleFileGottenEvent = (body) => {
  const { file } = body;
  console.log(file);
};

const handleErrorMessage = (body) => {
  const { message } = body;
  displayError(message);
};
