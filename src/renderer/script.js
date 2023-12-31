// Main renderer logic
const container = document.querySelector(".list");
const path_input = document.getElementById("path");
const search_input = document.getElementById("search-box");
const back_button = document.getElementById("back-button");
const reload_button = document.getElementById("reload-button");
const create_button = document.getElementById("create");
const close_button = document.getElementById("close");
const create_dialog = document.getElementById("create_dialog");
const create_new_form = document.getElementById("create_new_form");

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
  let node_icon = document.createElement("iconify-icon");
  node_icon.icon =
    file.type === "DT_REG"
      ? "ph:file-light"
      : file.type === "DT_DIR" && "ph:folder-light";
  node_icon.width = 20;
  node_icon.height = 20;
  node_icon.classList.add("node_icon");
  let node_name = document.createElement("span");
  node_name.classList.add("node_name");
  let node_type = document.createElement("span");
  node_type.classList.add("node_type");
  let node_size = document.createElement("span");
  node_size.classList.add("node_size");

  let temp = document.createElement("span");
  temp.innerText = file.name;
  if (file.file_type !== undefined) {
    node_type.innerText = `(${file.file_type})`;
  }
  node_size.innerText = file.size;

  node_name.appendChild(node_icon);
  node_name.appendChild(temp);
  node_name.appendChild(node_type);

  node.appendChild(node_name);
  node.appendChild(node_size);

  node.dataset.path = file.path;
  node.dataset.type = file.type;
  node.dataset.name = file.name;

  container.appendChild(node);
  return node;
}

function handleDblClick({ path, type }) {
  if (type === "DT_DIR") {
    // User clicked on a folder
    main(path);
  } else if (type === "DT_REG") {
    // User clicked on a file
    open(path);
  }
}

async function open(path) {
  await await fs.openFile(path);
}

path_input.addEventListener("change", (e) => {
  path_input.value = e.target.value.split("\\").join("/");
  main(e.target.value);
});

// 100,000,000.9 bytes
// 1st Recursion: 100,000 kB
// 2nd Recursion: 100 MB
// 3rd Recursion: < 4; return {value: 400, unit: 'MB'}

// What we need is an array of units, in increasing order

function improveReadablity(size, isUnix, isMac) {
  const units = ["B", "kB", "MB", "GB", "TB"];

  const sizeInt = size.value.toString().split(".")[0];

  // 100,000 bytes
  if (sizeInt.toString().length <= 3) {
    if (isUnix && size.value == 4 && size.unit === "kB") {
      return {
        value: "< 4",
        unit: "kB",
      };
    }
    if (isMac && size.value == 8 && size.unit === "kB") {
      return {
        value: "< 8",
        unit: "kB",
      };
    }
    return size;
  }

  let currentUnitIndex = units.indexOf(size.unit);

  if (++currentUnitIndex > units.length) {
    // Already at TB
    return size;
  }

  const newSize = {
    value: size.value / 1000,
    unit: units[currentUnitIndex],
  };
  return improveReadablity(newSize, isUnix);
}

async function main(path = "/") {
  try {
    clearList();

    search_input.value = "";

    const files = await fs.readDir(path);
    files.forEach(async (file) => {
      const node = createNode({
        name: file.name,
        file_type: file.file_type,
        size: "...",
        type: file.type,
        path: file.path,
      });
      node.addEventListener("dblclick", (e) => handleDblClick(node.dataset));

      let size;
      if (file.type === "DT_REG") {
        size = await await fs.getFileSize(file.path);
      } else if (file.type === "DT_DIR") {
        size = await await fs.getFolderSize(file.path);
      }

      let sizeInBytes = size ? Number(size.split(",").join("")) : undefined;

      if (sizeInBytes !== undefined && sizeInBytes.toString() !== "NaN") {
        const isUnix = await platform.isUnix();
        const isMac = await platform.isMac();
        size = improveReadablity(
          {
            value: sizeInBytes,
            unit: "B",
          },
          isUnix,
          isMac
        );

        setSize(node, size);
      }
    });

    // store last successfully visited path in localstorage
    const serializePath = (_path) => {
      while (_path.includes("//")) {
        _path = _path.split("//").join("/");
      }
      if (_path[_path.length - 1] === "/" && _path.length !== 1)
        _path = _path.slice(0, _path.length - 1);
      return _path;
    };

    path_input.value = serializePath(path);
    localStorage.setItem("LAST_VISITED_SUCC", serializePath(path));
  } catch (error) {
    main(localStorage.getItem("LAST_VISITED_SUCC"));
  }
}

function setSize(node, size) {
  let text = "";
  if (size.value === "< 4") {
    text = "< 4" + " " + size.unit;
  } else {
    text = size.value.toFixed(2).replace(/\.0+$/, "") + " " + size.unit;
  }
  node.querySelector(".node_size").innerText = text;
}

main(localStorage.getItem("LAST_VISITED_SUCC") || "/");

/// search func
search_input.addEventListener("input", handleSearch);

function handleSearch(e) {
  const list = document.querySelectorAll("div.node");

  list.forEach((item) => {
    if (!item.dataset.name.toLowerCase().includes(e.target.value.toLowerCase()))
      item.classList.add("hide");
    else item.classList.remove("hide");
  });
}

function clearList() {
  // clear the window
  let nodes = document.querySelectorAll("div.node");
  nodes.forEach((node) => {
    node.remove();
  });
}

back_button.addEventListener("click", () => {
  const currentPath = path_input.value;
  const previousPath = currentPath.split("/");
  previousPath.pop();
  main(previousPath.join("/") + "/");
});

create_button.addEventListener("click", () => {
  create_button.style.rotate = "-45deg";
  create_dialog.showModal();
  close_button.style.rotate = "-45deg";
});

close_button.addEventListener("click", () => {
  create_button.style.rotate = "0deg";
  close_button.style.rotate = "0deg";
  create_dialog.close();
});

create_new_form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (new_file_input.value.trim().length === 0) return;
  const submit_button = document.querySelector('button[type="submit"]');
  submit_button.innerText = "Creating...";
  submit_button.disabled = true;
  new_file_input.disabled = true;
  let rsp;
  if (choice === "File") {
    rsp = await await fs.createFile(path_input.value, new_file_input.value);
  } else if (choice === "Folder") {
    rsp = await await fs.createFolder(path_input.value, new_file_input.value);
  }

  create_button.style.rotate = "0deg";
  close_button.style.rotate = "0deg";
  if (rsp?.error) {
    submit_button.innerText = rsp.error;
    submit_button.classList.add("error");
    new_file_input.disabled = true;
    setTimeout(() => {
      submit_button.innerText = "Create in current directory";
      new_file_input.value = "";
      new_file_input.disabled = false;
      submit_button.disabled = false;
      submit_button.classList.remove("error");
      create_dialog.close();
    }, 3000);
    return;
  }
  submit_button.innerText = "Create in current directory";
  submit_button.disabled = false;
  new_file_input.disabled = false;
  new_file_input.value = "";
  create_dialog.close();
  main(localStorage.getItem("LAST_SUCC_VISITED"));
});

document.addEventListener("keydown", (e) => {
  if (create_dialog.open && e.key === "Escape") {
    create_button.style.rotate = "0deg";
    close_button.style.rotate = "0deg";
  }
});

reload_button.addEventListener("click", () => {
  main(path_input.value);
});
