const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data.json");

const defaultStructure = {
  guilds: {},
  notifications: [],
};

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify(defaultStructure, null, 2));
}

function getStorage() {
  const data = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(data);
  } catch {
    return defaultStructure;
  }
}

function saveStorage(updater) {
  const current = getStorage();
  const updated = updater(current);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  return updated;
}

module.exports = { getStorage, saveStorage };
