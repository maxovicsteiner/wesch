// Main renderer logic
const container = document.querySelector(".list");

function createNode(file) {
  /*
    <div class="node">
          <span class="node_name">
            haydar.txt
            <span class="node_type">(Text Document)</span>
          </span>
          <span class="node_size"> 16.2kB </span>
    </div>
    */
  let node = document.createElement("div");
  node.classList.add("node");
  let node_name = document.createElement("span");
  node_name.classList.add("node_name");
  let node_type = document.createElement("span");
  node_type.classList.add("node_type");
  let node_size = document.createElement("span");
  node_size.classList.add("node_size");

  node_name.innerText = file.name;
  node_type.innerText = ` (${file.type})`;
  node_size.innerText = file.size;

  node_name.appendChild(node_type);

  node.appendChild(node_name);
  node.appendChild(node_size);

  container.appendChild(node);
}

fs.readDir("C:/Users/hayda/Desktop/Home/Games").then((files) => {
  files.forEach((file) => {
    createNode({
      name: file.name,
      type: file.file_type,
      size: "9MB",
    });
  });
});
