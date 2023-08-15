const { generateSocketMessage } = require("../utils/generateSocketMessage");

const T_OPEN = "T_OPEN";
const T_READY = "T_READY";
const T_UPLOADING = "T_UPLOADING";

class Bucket {
  /**
   *
   * @param {string} code
   * @param {WebSocket} socket
   */
  constructor(code, socket) {
    this.code = code;
    this.S_SOCK = socket;
    this.R_SOCK = null;
    this.T_STATUS = T_OPEN;
    this.T_SIZE = null;
    this.T_RES = null;
    this.T_STRUCT;
  }

  /**
   * @param {WebSocket} socket
   */
  addReceiver(socket) {
    if (this.R_SOCK) return;
    this.R_SOCK = socket;
  }

  /**
   * @param {ArrayBuffer} DATA
   */
  uploadFile(bin_data) {
    this.T_RES = bin_data;
  }

  /**
   * @param {status} string
   */
  updateStatus(status) {
    this.T_STATUS = status;
    if (!this.R_SOCK) return;
    let res = generateSocketMessage("status-updated", {
      status: this.T_STATUS,
    });
    this.R_SOCK.send(res);
  }
}

module.exports = {
  Bucket,
  T_OPEN,
  T_UPLOADING,
  T_READY,
};
