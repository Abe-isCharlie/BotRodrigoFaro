require("dotenv").config()
const fetch = require("node-fetch");
const { EmbedBuilder } = require("discord.js");
const API_KEY = process.env.API_KEY

const esquadrão = [
  "SC Corinthians Paulista",
  "EC Bahia",
  "Botafogo FR",
  "Grêmio FBPA",
];

async function checkGames(client, canalID) {
  // const hoje = "2025-04-27"; 
  const hoje = new Date()
    .toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
    .split("/")
    .reverse()
    .join("-");
  console.log("Verificando jogos do Brasileirão em", hoje);

  try {
    const resposta = await fetch(
      `https://api.football-data.org/v4/competitions/BSA/matches?dateFrom=${hoje}&dateTo=${hoje}`,
      {
        headers: {
          "X-Auth-Token": API_KEY,
        },
      },
    );

    if (!resposta.ok) {
      console.error(
        `Erro ao buscar partidas: ${resposta.status} - ${resposta.statusText}`,
      );
      return;
    }

    const data = await resposta.json();
    const partidas = data.matches || [];

    if (partidas.length === 0) {
      console.log("Nenhum jogo encontrado para hoje.");
      return;
    }

    let enviouAlgo = false;

    for (const partida of partidas) {
      const timeCasa = partida.homeTeam.name;
      const timeFora = partida.awayTeam.name;

      const timeFoco =
        esquadrão.includes(timeCasa) || esquadrão.includes(timeFora);

      if (!timeFoco) continue;

      // Convertendo a data UTC do jogo para o horário de Brasília
      const horarioUTC = new Date(partida.utcDate);
      const horarioBR = new Date(
        horarioUTC.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
      );

      // Verifica se a data do jogo é a data de hoje no horário de Brasília
      const jogoHoje = horarioBR.toISOString().split("T")[0] === hoje;

      // Se o jogo não for hoje, ignora
      if (!jogoHoje) continue;

      const horarioBRFormatado = horarioBR.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      let corEmbed = "#3498db"; // Cor padrão azul

      // Verifica primeiro o time da casa
      if (esquadrão.includes(timeCasa)) {
        if (timeCasa === "SC Corinthians Paulista") corEmbed = "#000000";
        else if (timeCasa === "EC Bahia") corEmbed = "#0000FF";
        else if (timeCasa === "Botafogo FR") corEmbed = "#000000";
        else if (timeCasa === "Grêmio FBPA") corEmbed = "#0075B1";
      }
      // Se não encontrou, verifica o time visitante
      else if (esquadrão.includes(timeFora)) {
        if (timeFora === "SC Corinthians Paulista") corEmbed = "#000000";
        else if (timeFora === "EC Bahia") corEmbed = "#0000FF";
        else if (timeFora === "Botafogo FR") corEmbed = "#000000";
        else if (timeFora === "Grêmio FBPA") corEmbed = "#0075B1";
      }

      const timeEscolhido = esquadrão.find(
        (time) => time === timeCasa || time === timeFora,
      );
      const escudoTimeEscolhido = getEscudoTime(timeEscolhido);
      const iconAuthor =
        "https://upload.wikimedia.org/wikipedia/pt/thumb/4/42/Campeonato_Brasileiro_S%C3%A9rie_A_logo.png/250px-Campeonato_Brasileiro_S%C3%A9rie_A_logo.png";

      // Criar embed usando EmbedBuilder
      const embed = new EmbedBuilder()
        .setColor(parseInt(corEmbed.replace("#", ""), 16))
        .setTitle("⚽ HOJE TEM BRASILEIRÃO! ⚽")
        .setDescription(
          `${getEmojiTime(timeCasa)} ${timeCasa} 🆚 ${timeFora} ${getEmojiTime(timeFora)}`,
        )
        .setThumbnail(escudoTimeEscolhido)
        .addFields(
          {
            name: "⏰ Horário",
            value: `${horarioBRFormatado} (Horário de Brasília)`,
            inline: true,
          },
          {
            name: "🏟️ Estádio",
            value: partida.venue || "Não informado",
            inline: true,
          },
          {
            name: "📺 Onde assistir",
            value: "Premiere / Sportv",
            inline: true,
          },
        )
        .setImage("https://c.tenor.com/peTBjwmCIoAAAAAC/futebol-football.gif")
        .setAuthor({
          name: `Rodada ${partida.matchday || "?"} - Brasileirão Série A ${new Date().getFullYear()}`,
          iconURL:
            "https://upload.wikimedia.org/wikipedia/pt/thumb/4/42/Campeonato_Brasileiro_S%C3%A9rie_A_logo.png/250px-Campeonato_Brasileiro_S%C3%A9rie_A_logo.png", // Ícone corrigido
        })
        .setFooter({
          text: `${timeCasa} 🆚 ${timeFora}`,
          iconURL: iconAuthor,
        })
        .setTimestamp(new Date(partida.utcDate));

      const canal = await client.channels.fetch(canalID);
      await canal.send({ embeds: [embed] });

      enviouAlgo = true;
    }

    if (!enviouAlgo) {
      console.log("Nenhum dos 4 times joga hoje.");
    }
  } catch (erro) {
    console.error("Erro ao buscar partidas:", erro.message);
  }
}

// nao aguento mais função
function getEscudoTime(nomeTime) {
  const escudos = {
    "SC Corinthians Paulista":
      "https://upload.wikimedia.org/wikipedia/commons/c/c9/Escudo_sc_corinthians.png",
    "EC Bahia": "https://upload.wikimedia.org/wikipedia/pt/9/90/ECBahia.png",
    "Botafogo FR":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg/300px-Botafogo_de_Futebol_e_Regatas_logo.svg.png",
    "Grêmio FBPA":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Gremio_logo.svg/250px-Gremio_logo.svg.png",
  };

  return (
    escudos[nomeTime] ||
    "https://upload.wikimedia.org/wikipedia/pt/thumb/4/42/Campeonato_Brasileiro_S%C3%A9rie_A_logo.png/250px-Campeonato_Brasileiro_S%C3%A9rie_A_logo.png"
  );
}

function getEmojiTime(nomeTime) {
  const mapNormalizado = {
    "Fluminense FC": "fluminense",
    "CA Mineiro": "atlético-mg",
    "Grêmio FBPA": "grêmio",
    "SE Palmeiras": "palmeiras",
    "Botafogo FR": "botafogo",
    "Cruzeiro EC": "cruzeiro",
    "São Paulo FC": "são paulo",
    "EC Bahia": "bahia",
    "SC Recife": "sport",
    "SC Corinthians Paulista": "corinthians",
    "CR Vasco da Gama": "vasco",
    "EC Vitória": "vitória",
    "CR Flamengo": "flamengo",
    "Ceará SC": "ceará",
    "Fortaleza EC": "fortaleza",
    "EC Juventude": "juventude",
    "RB Bragantino": "rb bragantino",
    "Mirassol FC": "mirassol",
    "SC Internacional": "internacional",
    "Santos FC": "santos",
  };

  const emojis = {
    "atlético-mg": "<:atletico:1365114653893464064>",
    flamengo: "<:flamerda:1365362002008084610>",
    internacional: "<:inter:1365362084698652722>",
    palmeiras: "<:palmerda:1365362120438448259>",
    "são paulo": "<:trikas:1365113289712861315>",
    bahia: "<:bahia:1365112940038193192>",
    botafogo: "<:botafogo:1365115245726797944>",
    ceará: "<:ceara:1365113004814893126>",
    corinthians: "<:corinthians:1365112832319815764>",
    cruzeiro: "<:cruzeiro:1365112860514062447>",
    fluminense: "<:fluminense:1365113053368025160>",
    fortaleza: "<:fortaleza:1365115935198937199>",
    grêmio: "<:gremio:1365116302368182374>",
    juventude: "<:juventude:1365113169206444182>",
    mirassol: "<:mirassol:1365114107304611975>",
    "rb bragantino": "<:bragantino:1365113250013909022>",
    santos: "<:santos:1365113270830108692>",
    sport: "<:sport:1365117561817137195>",
    vasco: "<:vasco:1365117597674246144>",
    vitória: "<:vitoria:1365362041446989896>",
  };

  const nomeNormalizado = mapNormalizado[nomeTime] || nomeTime.toLowerCase();

  return emojis[nomeNormalizado] || "⚽";
}

module.exports = checkGames;
