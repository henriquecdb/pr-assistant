const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const { saveStorage } = require("../../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("configure")
    .setDescription("Configura o canal onde as informações serão publicadas.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("O canal de texto onde a mensagem será mantida.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("canal");

    saveStorage({ channelId: channel.id, messageId: null });

    await interaction.reply({
      content: `✅ Canal configurado com sucesso para ${channel}! A mensagem de status será gerada em breve.`,
      flags: 64,
    });
  },
};
