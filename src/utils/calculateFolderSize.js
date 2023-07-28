const { isUnix, isWin } = require("../main/index");
const childProcess = require("child_process");
const exec = require("util").promisify(childProcess.exec);
const { extractSizeFromTerminalOutputW, formatPathW } = require("./windows");
const { extractSizeFromTerminalOutputU } = require("./unix");

const MAX_BUFF_EXCEEDED_ERR = "stdout maxBuffer length exceeded";
const ROC = 100;
let CONTROLLERS_ARR = [];

async function calculateFolderSize(_event, dir, maxBuffer = 1024 * 1024 * ROC) {
  try {
    // windows
    if (isWin) {
      const controller = new AbortController();
      CONTROLLERS_ARR.push(controller);
      let command = `dir "${formatPathW(dir)}" /s`;
      const { stdout: standard } = await exec(command, {
        maxBuffer: maxBuffer,
        signal: controller.signal,
      });

      let size = extractSizeFromTerminalOutputW(standard);
      return size.toString();
    }
    // unix (macOs + Linux)
    else if (isUnix) {
      const controller = new AbortController();
      CONTROLLERS_ARR.push(controller);
      let command = `du -s "${dir}"`;
      const { stdout } = await exec(command, {
        maxBuffer: maxBuffer,
        signal: controller.signal,
      });
      let size = extractSizeFromTerminalOutputU(stdout);
      return size.toString();
    }
  } catch (error) {
    if (error.message === MAX_BUFF_EXCEEDED_ERR) {
      return await calculateFolderSize(_event, dir, maxBuffer * ROC);
    }
  }
}

function getControllersArray() {
  return CONTROLLERS_ARR;
}

function resetControllersArray() {
  CONTROLLERS_ARR = [];
}

module.exports = {
  calculateFolderSize,
  getControllersArray,
  resetControllersArray,
};
