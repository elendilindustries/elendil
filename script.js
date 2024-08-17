const devices = document.querySelectorAll(".device");
const router = document.querySelector(".router");
const addTouchNodesBtn = document.getElementById("addTouchNodes");
const claimAllBtn = document.getElementById("claimAll");
const dimmerSlider = document.querySelector(".slider");
const networkLoadBar = document.getElementById("networkLoadBar");
const simulation = document.getElementById("simulation");
const nodeCountInput = document.getElementById("nodeCount");
const packetLossInput = document.getElementById("packetLossPercentage");
const telemetryDiv = document.getElementById("telemetry");
const consoleDiv = document.getElementById("console");
const consoleToggle = document.getElementById("consoleToggle");

let networkLoad = 0;
let nodeCount = 3;
let packetLossPercentage = localStorage.getItem("packetLossPercentage") || 10;
let packetsInTransit = 0;
packetLossInput.value = packetLossPercentage;

function updateTelemetry() {
  const totalTouchNodes = document.querySelectorAll(".device.touchnode").length;
  const totalUnclaimed = document.querySelectorAll(".device.unclaimed").length;
  telemetryDiv.innerHTML = `
        <div>Total TouchNodes: ${totalTouchNodes}</div>
        <div>Unclaimed Nodes: ${totalUnclaimed}</div>
        <div>Packets in Transit: ${packetsInTransit}</div>
    `;
}

function logToConsole(message) {
  const jsonMessage = JSON.stringify(message, null, 4);
  consoleDiv.innerHTML += `${jsonMessage}\n\n`;
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function sendPacket(
  source,
  target,
  type,
  payload = null,
  isRedundancy = false
) {
  const packet = document.createElement("div");
  packet.className = "packet" + (isRedundancy ? " redundancy" : "");
  packet.style.left = source.offsetLeft + source.offsetWidth / 2 + "px";
  packet.style.top = source.offsetTop + source.offsetHeight / 2 + "px";
  simulation.appendChild(packet);

  packetsInTransit++;
  updateTelemetry();

  const startX = Math.round(parseInt(packet.style.left) / 20) * 20;
  const startY = Math.round(parseInt(packet.style.top) / 20) * 20;
  const endX =
    Math.round((target.offsetLeft + target.offsetWidth / 2) / 20) * 20;
  const endY =
    Math.round((target.offsetTop + target.offsetHeight / 2) / 20) * 20;

  const path = calculateGridPath(startX, startY, endX, endY);
  let pathIndex = 0;
  const trail = [];
  const trailLength = 10; // Number of trail segments

  function animate() {
    if (pathIndex < path.length) {
      packet.style.left = path[pathIndex].x + "px";
      packet.style.top = path[pathIndex].y + "px";

      // Create trail segment
      const trailSegment = document.createElement("div");
      trailSegment.className =
        "packet-trail" + (isRedundancy ? " redundancy" : "");
      trailSegment.style.left = path[pathIndex].x + "px";
      trailSegment.style.top = path[pathIndex].y + "px";
      simulation.appendChild(trailSegment);
      trail.push(trailSegment);

      // Remove old trail segments
      if (trail.length > trailLength) {
        const oldSegment = trail.shift();
        oldSegment.remove();
      }

      pathIndex++;
      requestAnimationFrame(animate);
    } else {
      packet.remove();
      // Remove remaining trail
      trail.forEach((segment) => segment.remove());
      packetsInTransit--;
      updateTelemetry();
      if (!isRedundancy && Math.random() * 100 < packetLossPercentage) {
        logToConsole({ event: "packetLost", target: target.textContent, type });
        handlePacketLoss(target, type, payload);
      } else {
        executeCommand(target, type, payload);
        if (isRedundancy) {
          logToConsole({
            event: "redundancySuccess",
            source: source.textContent,
            target: target.textContent,
            type,
          });
        }
      }
    }
  }

  requestAnimationFrame(animate);
  updateNetworkLoad(10);
}
function sendPacket(
  source,
  target,
  type,
  payload = null,
  isRedundancy = false
) {
  const packet = document.createElement("div");
  packet.className = "packet" + (isRedundancy ? " redundancy" : "");
  packet.style.left = source.offsetLeft + source.offsetWidth / 2 + "px";
  packet.style.top = source.offsetTop + source.offsetHeight / 2 + "px";
  simulation.appendChild(packet);

  packetsInTransit++;
  updateTelemetry();

  const startX = Math.round(parseInt(packet.style.left) / 20) * 20;
  const startY = Math.round(parseInt(packet.style.top) / 20) * 20;
  const endX =
    Math.round((target.offsetLeft + target.offsetWidth / 2) / 20) * 20;
  const endY =
    Math.round((target.offsetTop + target.offsetHeight / 2) / 20) * 20;

  const path = calculateGridPath(startX, startY, endX, endY);
  let pathIndex = 0;
  const trail = [];
  const trailLength = 10; // Number of trail segments

  function animate() {
    if (pathIndex < path.length) {
      packet.style.left = path[pathIndex].x + "px";
      packet.style.top = path[pathIndex].y + "px";

      // Create trail segment
      const trailSegment = document.createElement("div");
      trailSegment.className =
        "packet-trail" + (isRedundancy ? " redundancy" : "");
      trailSegment.style.left = path[pathIndex].x + "px";
      trailSegment.style.top = path[pathIndex].y + "px";
      simulation.appendChild(trailSegment);
      trail.push(trailSegment);

      // Remove old trail segments
      if (trail.length > trailLength) {
        const oldSegment = trail.shift();
        oldSegment.remove();
      }

      pathIndex++;
      requestAnimationFrame(animate);
    } else {
      packet.remove();
      // Remove remaining trail
      trail.forEach((segment) => segment.remove());
      packetsInTransit--;
      updateTelemetry();
      if (!isRedundancy && Math.random() * 100 < packetLossPercentage) {
        logToConsole({ event: "packetLost", target: target.textContent, type });
        handlePacketLoss(target, type, payload);
      } else {
        executeCommand(target, type, payload);
        if (isRedundancy) {
          logToConsole({
            event: "redundancySuccess",
            source: source.textContent,
            target: target.textContent,
            type,
          });
        }
      }
    }
  }

  requestAnimationFrame(animate);
  updateNetworkLoad(10);
}

function calculateGridPath(startX, startY, endX, endY) {
  const path = [];
  let currentX = startX;
  let currentY = startY;

  while (currentX !== endX || currentY !== endY) {
    path.push({ x: currentX, y: currentY });

    if (currentX !== endX) {
      currentX += endX > currentX ? 20 : -20;
    } else if (currentY !== endY) {
      currentY += endY > currentY ? 20 : -20;
    }
  }

  path.push({ x: endX, y: endY });
  return path;
}

function executeCommand(target, type, payload) {
  if (type === "claim") {
    claimDevice(target);
  } else if (type === "toggle") {
    target.classList.toggle("on");
  } else if (type === "setValue") {
    target.style.opacity = payload / 100;
  }
  logToConsole({
    event: "commandExecuted",
    target: target.textContent,
    type,
    payload,
  });
}

function handlePacketLoss(target, type, payload) {
  const availableDevices = Array.from(
    document.querySelectorAll(".device.touchnode")
  ).filter((d) => d !== target);
  if (availableDevices.length > 0) {
    const redundancyDevice =
      availableDevices[Math.floor(Math.random() * availableDevices.length)];
    logToConsole({
      event: "impliedAuthority",
      source: redundancyDevice.textContent,
      target: target.textContent,
      type,
    });
    sendPacket(redundancyDevice, target, type, payload, true);
  }
}

function updateNetworkLoad(amount) {
  networkLoad = Math.min(networkLoad + amount, 100);
  networkLoadBar.style.width = networkLoad + "%";
  setTimeout(() => {
    networkLoad = Math.max(networkLoad - amount, 0);
    networkLoadBar.style.width = networkLoad + "%";
  }, 1000);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function addTouchNodes(count) {
  for (let i = 0; i < count; i++) {
    nodeCount++;
    const newNode = document.createElement("div");
    newNode.className = "device unclaimed";
    newNode.innerHTML = `<i class="lucide-cpu"></i><br>TN${nodeCount}`;
    newNode.style.top =
      Math.round((Math.random() * (simulation.offsetHeight - 100)) / 20) * 20 +
      "px";
    newNode.style.left =
      Math.round((Math.random() * (simulation.offsetWidth - 100)) / 20) * 20 +
      "px";
    newNode.addEventListener("click", () => handleDeviceClick(newNode));
    makeDraggable(newNode);
    simulation.appendChild(newNode);
  }
  updateTelemetry();
  logToConsole({ event: "nodesAdded", count });
}

function handleDeviceClick(device) {
  if (device.classList.contains("unclaimed")) {
    sendPacket(router, device, "claim");
  } else if (!device.classList.contains("unclaimed")) {
    sendPacket(router, device, "toggle");
  }
}

function claimDevice(device) {
  device.classList.remove("unclaimed");
  device.classList.add("touchnode");
  logToConsole({ event: "deviceClaimed", device: device.textContent });
  updateTelemetry();
}

function claimAllUnclaimed() {
  const unclaimedDevices = document.querySelectorAll(".device.unclaimed");
  unclaimedDevices.forEach((device) => sendPacket(router, device, "claim"));
  logToConsole({ event: "claimAllInitiated", count: unclaimedDevices.length });
}

function makeDraggable(element) {
  let isDragging = false;
  let offset = { x: 0, y: 0 };

  element.addEventListener("mousedown", startDragging);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDragging);

  function startDragging(e) {
    isDragging = true;
    offset = {
      x: e.clientX - element.offsetLeft,
      y: e.clientY - element.offsetTop,
    };
    element.style.zIndex = 1000;
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const newX = Math.round((e.clientX - offset.x) / 20) * 20;
    const newY = Math.round((e.clientY - offset.y) / 20) * 20;
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
  }

  function stopDragging() {
    isDragging = false;
    element.style.zIndex = "";
  }
}

devices.forEach((device) => {
  device.addEventListener("click", () => handleDeviceClick(device));
  makeDraggable(device);
});

makeDraggable(router);

addTouchNodesBtn.addEventListener("click", () => {
  const count = parseInt(nodeCountInput.value) || 1;
  addTouchNodes(count);
});

claimAllBtn.addEventListener("click", claimAllUnclaimed);

const debouncedDimmerUpdate = debounce((value) => {
  const dimmer = document.querySelector(".device.dimmer");
  sendPacket(router, dimmer, "setValue", value);
}, 200);

dimmerSlider.addEventListener("input", (e) => {
  debouncedDimmerUpdate(e.target.value);
});

packetLossInput.addEventListener(
  "input",
  debounce((e) => {
    packetLossPercentage = Math.max(
      0,
      Math.min(100, parseInt(e.target.value) || 0)
    );
    localStorage.setItem("packetLossPercentage", packetLossPercentage);
    logToConsole({ event: "packetLossUpdated", value: packetLossPercentage });
  }, 1000)
);

nodeCountInput.addEventListener(
  "input",
  debounce((e) => {
    const count = parseInt(e.target.value) || 1;
    addTouchNodes(count);
  }, 1000)
);

consoleToggle.addEventListener("click", () => {
  if (consoleDiv.style.width === "300px" || consoleDiv.style.width === "") {
    consoleDiv.style.width = "0px";
    consoleToggle.textContent = "Show Console";
  } else {
    consoleDiv.style.width = "300px";
    consoleToggle.textContent = "Hide Console";
  }
});

// Adjust simulation size on window resize
window.addEventListener("resize", () => {
  simulation.style.width = window.innerWidth + "px";
  simulation.style.height = window.innerHeight + "px";
});

// Initial setup
updateTelemetry();
simulation.style.width = window.innerWidth + "px";
simulation.style.height = window.innerHeight + "px";
logToConsole({
  event: "simulationInitialized",
  nodeCount,
  packetLossPercentage,
});

// Update existing nodes with icons
document.querySelectorAll(".device").forEach((device) => {
  if (!device.querySelector("i")) {
    const text = device.textContent;
    device.innerHTML = `<i class="lucide-cpu"></i><br>${text}`;
  }
});
