const fs = require("fs");
const path = require("path");

const mapsPath = path.join(__dirname, "../config/maps.json");

function getAvailableMaps() {
  try {
    if (!fs.existsSync(mapsPath)) {
      return [];
    }
    const data = fs.readFileSync(mapsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler o arquivo maps.json:", error.message);
    return [];
  }
}

module.exports = { getAvailableMaps };
