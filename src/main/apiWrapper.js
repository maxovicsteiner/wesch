const fs = require("fs");
const Node = require("../classes/Node");
const {
  getControllersArray,
  resetControllersArray,
} = require("../utils/calculateFolderSize");
const { findDotIndex } = require("../utils/findDotIndex");
const { promisify } = require("util");
const { shell } = require("electron");
const { isWin } = require(".");
const { getFileNameFromPath } = require("../utils");
const downloadsFolder = require("downloads-folder");

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
    await promisify(fs.writeFile)(generatedPath, "");
  } catch (error) {
    return { error: error.message };
  }
}

const serializePath = (_path) => {
  while (_path.includes("//")) {
    _path = _path.split("//").join("/");
  }
  if (_path[_path.length - 1] === "/" && _path.length !== 1)
    _path = _path.slice(0, _path.length - 1);
  return _path;
};

async function handleCreateFolder(_event, path, name) {
  let generatedPath = path + "/" + name;
  if (path === "/") generatedPath = path + name;

  generatedPath = serializePath(generatedPath);

  const exists = fs.existsSync(generatedPath);
  if (exists) {
    return { error: "Already exists in current directory" };
  }

  try {
    await promisify(fs.mkdir)(generatedPath, {
      recursive: true,
    });
  } catch (error) {
    return { error: error.message };
  }
}

async function handleOpenFile(_event, path) {
  try {
    let rsp = "";
    if (isWin) {
      rsp = await shell.openPath(path.split("/").join("\\"));
    } else {
      rsp = await shell.openPath(path);
    }
    if (rsp !== "") throw new Error(rsp);
  } catch (error) {
    console.log(error.message);
  }
}

async function handleGetFileBytes(_event, _path) {
  try {
    const path = serializePath(_path);
    const bytes = await promisify(fs.readFile)(path);
    const name = getFileNameFromPath(path);
    console.log(bytes, name);
    return { bytes, name };
  } catch (error) {
    return {
      error: `Upload error - File could not be uploaded (${error.message})`,
    };
  }
}

async function handleDownloadFile(_event, content, name) {
  try {
    const downloadsPath = serializePath(downloadsFolder());
    const completePath = downloadsPath + "/" + name;
    await fs.writeFile(completePath, content.toString());
  } catch (error) {}
}

module.exports = {
  handleCreateFile,
  handleCreateFolder,
  handleReadDir,
  handleOpenFile,
  handleGetFileBytes,
  handleDownloadFile,
};
