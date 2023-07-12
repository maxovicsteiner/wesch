const { getDirectoryFromPath } = require("./getDirectoryFromPath");
const { calculateFileSize } = require("./calculateFileSize");
const { getFileNameFromPath } = require("./getFileNameFromPath");
const {
  extractFileFromTerminalOutputW,
} = require("./windows/extractFileFromTerminalOutputW");
const { extractSizeFromFileW } = require("./windows/extractSizeFromFileW");
const { findDotIndex } = require("./findDotIndex");
const { getTypeFromExtension } = require("./getTypeFromExtension");
const { calculateFolderSize } = require("./calculateFolderSize");

module.exports = {
  getDirectoryFromPath,
  calculateFileSize,
  getFileNameFromPath,
  extractFileFromTerminalOutputW,
  extractSizeFromFileW,
  findDotIndex,
  getTypeFromExtension,
  calculateFolderSize,
};
