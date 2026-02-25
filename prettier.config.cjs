const fs = require("node:fs");
const path = require("node:path");

const configPath = path.join(__dirname, ".config", ".prettierrc");
const configContent = fs.readFileSync(configPath, "utf8");

module.exports = JSON.parse(configContent);
