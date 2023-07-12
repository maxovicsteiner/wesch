function findDotIndex(string) {
  let dotIndex = null;
  for (let i = string.length - 1; i >= 0; i--) {
    if (string[i] === ".") {
      dotIndex = i;
      break;
    }
  }
  return dotIndex;
}

module.exports = {
  findDotIndex,
};
