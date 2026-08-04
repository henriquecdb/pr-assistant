const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error("Erro no autocomplete:", error);
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error("Erro ao executar comando:", error);
        const content = "Ocorreu um erro ao executar este comando!";
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, flags: 64 });
        } else {
          await interaction.reply({ content, flags: 64 });
        }
      }
    }
  },
};
