function extractFileFromTerminalOutputU(output, name) {
  // skip 1 line for total
  const lines = output.split("\n");
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].includes(name)) {
      return lines[i].trim();
    }
  }
}

module.exports = {
  extractFileFromTerminalOutputU,
};
