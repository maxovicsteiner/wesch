function getFileNameFromPath(path) {
  //Path: C:/Users/hayda/haydar.txt
  //Dir:  C:/Users/hayda
  let output = [];
  for (let i = path.length - 1; i > 0; i--) {
    if (path[i] === "/") {
      break;
    }
    output.unshift(path[i]);
  }

  return output.join("");
}

module.exports = {
  getFileNameFromPath,
};
