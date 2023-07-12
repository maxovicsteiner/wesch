const { isUnix, isWin } = require("../main/index");
const childProcess = require("child_process");
const exec = require("util").promisify(childProcess.exec);
const { extractSizeFromTerminalOutputW, formatPathW } = require("./windows");

async function calculateFolderSize(_event, dir) {
  try {
    // windows
    if (isWin) {
      let command = `dir "${formatPathW(dir)}" /s`;
      const { stdout: standard } = await exec(command);
      let size = extractSizeFromTerminalOutputW(standard);
      return size.toString();
    }
    // unix (macOs + Linux)
    else if (isUnix) {
      const { stdout } = await exec(`ls %{dir}`);
    }
  } catch (error) {}
}

module.exports = {
  calculateFolderSize,
};
