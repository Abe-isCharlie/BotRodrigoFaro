const { ChannelType } = require("discord.js");
const aniversarios = require("../data/aniversarios.json");

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

module.exports = async function checarAniversarios(client) {
  const hoje = new Date();
  const diaHoje = String(hoje.getDate()).padStart(2, "0");
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
  const hojeStr = `${diaHoje}/${mesHoje}`;

  const canal = await client.channels.fetch("1149843590391021692");
  if (!canal || canal.type !== ChannelType.GuildText) return;

  for (const [id, info] of Object.entries(aniversarios)) {
    if (info.data.startsWith(hojeStr)) {
      const idade = calcIdade(info.data);
      canal.send(`🎉 Parabéns <@${id}> pelo seu aniversário de ${idade} anos! 🎉`);
    }
  }
};
