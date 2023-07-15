const { isUnix, isWin } = require("../main/index");
const childProcess = require("child_process");
const exec = require("util").promisify(childProcess.exec);
const { extractSizeFromTerminalOutputW, formatPathW } = require("./windows");

const MAX_BUFF_EXCEEDED_ERR = "stdout maxBuffer length exceeded";
const ROF = 100;
const CONTROLLERS_ARR = [];

async function calculateFolderSize(_event, dir, maxBuffer = 1024 * 1024 * ROF) {
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
      const { stdout } = await exec(`ls %{dir}`);
    }
  } catch (error) {
    if (error.message === MAX_BUFF_EXCEEDED_ERR) {
      return await calculateFolderSize(_event, dir, maxBuffer * ROF);
    }
  }
}

function getControllersArray() {
  return CONTROLLERS_ARR;
}

module.exports = {
  calculateFolderSize,
  getControllersArray,
};
