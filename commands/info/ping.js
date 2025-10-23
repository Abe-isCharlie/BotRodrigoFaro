const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responde com o ping do bot"),
  async execute(interaction) {
    await interaction.reply(`Pong! Latência: ${interaction.client.ws.ping}ms`);
  },
};
