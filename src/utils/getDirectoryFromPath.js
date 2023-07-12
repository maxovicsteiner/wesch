function getDirectoryFromPath(path) {
  return path.split("/").slice(0, -1).join("/");
}

module.exports = {
  getDirectoryFromPath,
};
