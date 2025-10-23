const { SlashCommandBuilder } = require('discord.js');
const checkGames = require('../../utils/checkGames');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testejogos')
    .setDescription('Faz uma checagem manual dos jogos de hoje'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });  // usar flags, esse jeito está decrepcado(isso existe em português?)
    const canalID = interaction.channel.id;
    
    await checkGames(interaction.client, canalID);

    await interaction.editReply('✅ Verificação concluída!');
  },
};