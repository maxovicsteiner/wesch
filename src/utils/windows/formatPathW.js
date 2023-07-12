function formatPathW(path) {
  if (path === "/" || path === "") return "\\";
  const formatted = path.split("/").join("\\");
  return formatted;
}

module.exports = { formatPathW };
