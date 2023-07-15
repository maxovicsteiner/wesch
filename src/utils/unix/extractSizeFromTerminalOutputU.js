function extractSizeFromTerminalOutputU(output) {
  return output.split("\t")[0];
}

module.exports = {
  extractSizeFromTerminalOutputU,
};
