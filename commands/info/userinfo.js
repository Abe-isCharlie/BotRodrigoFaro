const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const data = require("../../data/aniversarios.json");
const path = require("path")

function calcIdade(dataNasc) {
  const [dia, mes, ano] = dataNasc.split("/").map(Number);
  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;

  if (
    hoje.getMonth() + 1 < mes ||
    (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)
  ) {
    idade--;
  }
  return idade;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Mostra informações do usuário")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("Usuário para mostrar informações")
        .setRequired(false),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("usuário") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const info = data[user.id];

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`Informações de ${member.nickname || user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "Nome", value: user.username, inline: true },
        {
          name: "Entrou no server em",
          value: member.joinedAt.toLocaleDateString("pt-BR"),
          inline: true,
        },
        {
          name: "Entrou no discord em",
          value: user.createdAt.toLocaleDateString("pt-BR"),
          inline: true,
        },
      )
      .setFooter({
        text: `Solicitado por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (info) {
      const idade = calcIdade(info.data);
      embed.addFields(
        { name: "Idade", value: `${idade} anos`, inline: true },
        { name: "Aniversário", value: info.data, inline: true },
        { name: "Time", value: info.time, inline: true },
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};
