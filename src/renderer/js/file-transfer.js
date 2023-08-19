"use strict";

const T_UPLOADING = "T_UPLOADING";
const T_READY = "T_READY";

const ws = new WebSocket("ws://localhost:8080");

let userReadyToDownload = false,
  fileReadyToDownload = false,
  fileData = null;

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

let previousErrorOrSuccessTimeout = null;
/**
 *
 * @param {string} message
 * @param {"error" | "success"} nature
 */
function displayErrorOrSuccess(message, nature) {
  errorOrSuccess.innerText = message;
  errorOrSuccess.dataset.nature = nature;
  if (previousErrorOrSuccessTimeout)
    clearTimeout(previousErrorOrSuccessTimeout);
  const currentTimeout = setTimeout(
    () => {
      errorOrSuccess.innerText = "";
      nature === "error" && actionButton.removeAttribute("disabled");
      if (previousErrorOrSuccessTimeout === currentTimeout)
        previousErrorOrSuccessTimeout = null;
    },
    nature === "error" ? 3000 : 10000
  );
  previousErrorOrSuccessTimeout = currentTimeout;
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
      break;
    case "Inspect bucket":
      req = generateSocketMessage("join-bucket", { code: bucket_id.value });
      actionButton.setAttribute("disabled", true);
      break;
    case "Upload file":
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
      break;
    case "Download content when ready":
      userReadyToDownload = true;
      if (fileReadyToDownload)
        await handleDownloadWrapper(fileData.file, fileData.name);
      actionButton.setAttribute("disabled", true);
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

const handleStatusUpdatedEvent = (body) => {
  const { status } = body;
  changeStatusPlaceholder(status);
  if (status === T_READY) {
    let req = generateSocketMessage("get-file", {
      code: bucket_id.value.trim(),
    });
    ws.send(req);
  }
};

const handleFileGottenEvent = async (body) => {
  const { file } = body;
  fileReadyToDownload = true;
  fileData = {
    file: file.file,
    name: file.name,
  };
  if (userReadyToDownload) await handleDownloadWrapper(file.file, file.name);
};

async function handleDownloadWrapper(content, name) {
  const res = await fs.downloadFile(content, name);
  if (res.path)
    displayErrorOrSuccess(
      `File has been successfully downloaded and is available at:\n${res.path}`,
      "success"
    );
  actionButton.removeAttribute("disabled");
  actionButton.innerText = `Open ${name}`;

  if (res.error) displayErrorOrSuccess(res.error, "error");
}

const handleErrorMessage = (body) => {
  const { message } = body;
  displayErrorOrSuccess(message, "error");
};
