function extractFileFromTerminalOutputW(files, name) {
  const invertedName = name.split("").reverse().join("");
  let data = files.split("\r\n");

  if (data?.length === 1) return data[0];

  // Invert the data
  data = [
    ...data.map((line) => {
      return line.split("").reverse().join("");
    }),
  ];

  // loop through the data until we find the file name
  let loopOutput = null;
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i].trim();
    if (data[i].length === 0) continue;
    if (data[i].slice(0, invertedName.length) === invertedName) {
      loopOutput = data[i];
      break;
    }
  }

  if (loopOutput === null) return null;
  else return loopOutput.split("").reverse().join("");
}

module.exports = {
  extractFileFromTerminalOutputW,
};
