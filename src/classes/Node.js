const { getDirectoryFromPath } = require("../utils/getDirectoryFromPath");
const { findDotIndex } = require("../utils/findDotIndex");
const { getTypeFromExtension } = require("../utils/getTypeFromExtension");

class Node {
  constructor(name, path, type) {
    // Get name and path
    this.name = name;
    this.path = path;

    this.directory = getDirectoryFromPath(this.path);

    // Get node type (File or Directory)
    if (type === 0) this.type = "DT_REG";
    else if (type === 1) this.type = "DT_DIR";
    else this.type = "UNKNOWN";

    if (this.type === "DT_REG") {
      // Get file type from extension
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
