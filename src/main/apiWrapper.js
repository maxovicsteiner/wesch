const fs = require("fs");
const Node = require("../classes/Node");
const { getControllersArray } = require("../utils/calculateFolderSize");

function handleReadDir(_event, path) {
  const exists = fs.existsSync(path);

  if (!exists) {
    return new Error("Directory doesn't exist or is protected");
  }

  getControllersArray().forEach((controller) => {
    controller.abort();
  });

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
      if (files[i].name.endsWith(".ini")) {
        // Ignore INI files
        continue;
      }
      let node = new Node(files[i].name, node_path, 0);
      output.push(node);
    } else if (files[i].isDirectory()) {
      let node = new Node(files[i].name, node_path, 1);
      output.push(node);
    } else {
      continue;
    }
  }
  return output;
}

module.exports = {
  handleReadDir,
};
