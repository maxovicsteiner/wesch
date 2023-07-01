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

function getTypeFromExtension(extension) {
  // TODO: Remake hash table
  return `${extension.toUpperCase()} File`;
}

class Node {
  constructor(name, path, type) {
    this.name = name;
    this.path = path;
    if (type === 0) this.type = "DT_REG";
    else if (type === 1) this.type = "DT_DIR";
    else this.type = "UNKNOWN";

    if (this.type === "DT_REG") {
      let dotIndex = findDotIndex(this.name);
      if (dotIndex !== null) {
        let extension = this.name.slice(dotIndex + 1);
        this.file_type = getTypeFromExtension(extension);
      }
    } else if (this.type === "DT_DIR") {
      this.file_type = "File Folder";
    }
  }
}

module.exports = Node;
