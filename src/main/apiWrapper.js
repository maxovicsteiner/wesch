const fs = require("fs");
const Node = require("../classes/Node");
const {
  getControllersArray,
  resetControllersArray,
} = require("../utils/calculateFolderSize");
const { findDotIndex } = require("../utils/findDotIndex");

function handleReadDir(_event, path) {
  const exists = fs.existsSync(path);

  if (!exists) {
    return new Error("Directory doesn't exist or is protected");
  }

  getControllersArray().forEach((controller) => {
    controller.abort();
  });

  resetControllersArray();

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

async function handleCreateFile(_event, path, name) {
  if (path === "/") path = "";
  let dotIndex = findDotIndex(name);
  if (dotIndex === null) {
    name += ".txt";
  }
  dotIndex = findDotIndex(name);

  let generatedPath = path + "/" + name;
  let exists = fs.existsSync(generatedPath);
  let temp = name;

  let occurence = 1;
  while (exists) {
    temp = name.split(".");
    temp[0] += ` (${occurence})`;
    temp = temp.join(".");
    generatedPath = path + "/" + temp;
    occurence++;
    exists = fs.existsSync(generatedPath);
  }
  name = temp;

  try {
    await require("util").promisify(fs.writeFile)(generatedPath, "");
  } catch (error) {
    return { error: error.message };
  }
}

module.exports = {
  handleCreateFile,
  handleReadDir,
};
