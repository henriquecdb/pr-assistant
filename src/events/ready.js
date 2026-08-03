const { Events } = require("discord.js");
const { startUpdater } = require("../services/updater");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Bot online como ${client.user.tag}!`);

    startUpdater(client);
  },
};
