const fs = require("fs");
const Node = require("../classes/Node");

function handleReadDir(_event, path) {
  const files = fs.readdirSync(path, { withFileTypes: true });
  let output = [];
  for (let i = 0; i < files.length; i++) {
    let node_path;

    if (path[path.length - 1] === "/") {
      node_path = path + files[i].name;
    } else {
      node_path = path + "/" + files[i].name;
    }
    if (files[i].isFile()) {
      output.push(new Node(files[i].name, node_path, 0));
    } else if (files[i].isDirectory()) {
      output.push(new Node(files[i].name, node_path, 1));
    } else {
      continue;
    }
  }
  return output;
}

module.exports = {
  handleReadDir,
};
