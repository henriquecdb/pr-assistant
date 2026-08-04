const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const { saveStorage } = require("../../utils/storage");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("configure")
    .setDescription(
      "Configura o canal onde as informações serão publicadas neste servidor.",
    )
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
    const guildId = interaction.guildId;

    saveStorage((data) => {
      if (!data.guilds) data.guilds = {};
      data.guilds[guildId] = {
        channelId: channel.id,
        messageId: null,
      };
      return data;
    });

    await interaction.reply({
      content: `✅ Canal deste servidor configurado com sucesso para ${channel}!`,
      flags: 64,
    });
  },
};
