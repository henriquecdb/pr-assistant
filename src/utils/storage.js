const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data.json");

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(
    filePath,
    JSON.stringify({ channelId: null, messageId: null }, null, 2),
  );
}

function getStorage() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function saveStorage(data) {
  const current = getStorage();
  const updated = { ...current, ...data };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  return updated;
}

module.exports = { getStorage, saveStorage };
