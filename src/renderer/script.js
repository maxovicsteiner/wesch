// Main renderer logic
const container = document.querySelector(".list");

function createNode(file) {
  /*
    <div class="node" data-path={path}>
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
  node_type.innerText = ` (${file.file_type})`;
  node_size.innerText = file.size;

  node_name.appendChild(node_type);

  node.appendChild(node_name);
  node.appendChild(node_size);

  node.dataset.path = file.path;
  node.dataset.type = file.type;

  container.appendChild(node);
}

function handleDblClick(e) {
  const { path, type } = e.target.dataset;

  if (type === "DT_DIR") {
    // User clicked on a folder
    main(path);
  }
}

async function main(path = "/") {
  //clear the window
  let nodes = document.querySelectorAll("div.node");
  nodes.forEach((node) => {
    node.remove();
  });

  const files = await fs.readDir(path);
  files.forEach((file) => {
    createNode({
      name: file.name,
      file_type: file.file_type,
      size: "9MB",
      type: file.type,
      path: file.path,
    });
  });
  nodes = document.querySelectorAll("div.node");
  nodes.forEach((node) => {
    node.addEventListener("dblclick", handleDblClick);
  });
}

main();
