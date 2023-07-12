const { isUnix, isWin } = require("../main/index");
const childProcess = require("child_process");
const exec = require("util").promisify(childProcess.exec);
const { getDirectoryFromPath } = require("./getDirectoryFromPath");
const { getFileNameFromPath } = require("./getFileNameFromPath");
const {
  extractFileFromTerminalOutputW,
  extractSizeFromFileW,
  formatPathW,
} = require("./windows");

async function calculateFileSize(_event, path) {
  try {
    const dir = getDirectoryFromPath(path);
    const name = getFileNameFromPath(path);
    // windows
    if (isWin) {
      let command = `dir "${formatPathW(dir)}" | find "${name}"`;
      const { stdout: standard } = await exec(command);
      let file = extractFileFromTerminalOutputW(standard, name);
      if (file === null) {
        command = `dir "${formatPathW(dir)}" /a:h | find "${name}"`;
        // Possibility that file is hidden, redo the process
        const { stdout: hidden } = await exec(command);
        file = extractFileFromTerminalOutputW(hidden, name);
      }
      const size = extractSizeFromFileW(file, name);
      return size;
    }
    // unix (macOs + Linux)
    else if (isUnix) {
      const { stdout } = await exec(`ls %{dir}`);
    }
  } catch (error) {}
}

module.exports = {
  calculateFileSize,
};
