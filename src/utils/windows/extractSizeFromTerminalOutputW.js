function extractSizeFromTerminalOutputW(output) {
  const INDEX_OF_DIR_SIZE_IN_WINDOWS = 3;
  let arr = output.split("\r\n");
  let line = arr[arr.length - INDEX_OF_DIR_SIZE_IN_WINDOWS];
  let size = line.split("(s)")[1].trim().split(" ")[0];
  return size;
}

module.exports = {
  extractSizeFromTerminalOutputW,
};
