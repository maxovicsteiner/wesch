const fs = require("fs");
const Node = require("../classes/Node");

function handleReadDir(_event, path) {
  const files = fs.readdirSync(path, { withFileTypes: true });
  let output = [];
  for (let i = 0; i < files.length; i++) {
    if (files[i].isFile()) {
      output.push(new Node(files[i].name, files[i].path, 0));
    } else if (files[i].isDirectory()) {
      output.push(new Node(files[i].name, files[i].path, 1));
    } else {
      continue;
    }
  }
  return output;
}

module.exports = {
  handleReadDir,
};
