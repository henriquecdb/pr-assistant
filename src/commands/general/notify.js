const { SlashCommandBuilder } = require("discord.js");
const { getAvailableMaps } = require("../../utils/maps");
const { saveStorage } = require("../../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("notify")
    .setDescription(
      "Ativa ou desativa notificações via DM para quando seu mapa favorito estiver rodando!",
    )
    .addStringOption((option) =>
      option
        .setName("mapa")
        .setDescription("Digite o nome do mapa desejado...")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const maps = getAvailableMaps();

    const filtered = maps
      .filter((map) => map.name.toLowerCase().includes(focusedValue))
      .slice(0, 25);

    await interaction.respond(
      filtered.map((map) => ({ name: map.name, value: map.name })),
    );
  },

  async execute(interaction) {
    const selectedMap = interaction.options.getString("mapa");
    const userId = interaction.user.id;

    let action = "";

    saveStorage((data) => {
      if (!data.notifications) data.notifications = [];

      const index = data.notifications.findIndex(
        (n) =>
          n.userId === userId &&
          n.mapName.toLowerCase() === selectedMap.toLowerCase(),
      );

      if (index !== -1) {
        data.notifications.splice(index, 1);
        action = "removed";
      } else {
        data.notifications.push({ userId, mapName: selectedMap });
        action = "added";
      }

      return data;
    });

    if (action === "added") {
      await interaction.reply({
        content: `✅ Notificação **ativada** para o mapa **${selectedMap}**! Certifique-se de manter suas DMs abertas.`,
        flags: 64,
      });
    } else {
      await interaction.reply({
        content: `🔕 Notificação **desativada** para o mapa **${selectedMap}**.`,
        flags: 64,
      });
    }
  },
};
