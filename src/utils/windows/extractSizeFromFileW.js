function extractSizeFromFileW(file, name) {
  let deleted = file
    .split("")
    .splice(0, file.length - name.length - 1)
    .join("");
  let output = deleted.split(" ");
  return output[output.length - 1];
}

module.exports = { extractSizeFromFileW };
