const { Events } = require("discord.js");
const checkGames = require("../utils/checkGames");
const deploy = require("../deploy-commands");
const checarAniversarios = require("../utils/checkBirthdays");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Pronto! Logado como ${client.user.tag}`);

    const canalID = "1149843590391021692";

    checkGames(client, canalID);
    checarAniversarios(client);

    setInterval(
      () => {
        checkGames(client, canalID);
      },
      12 * 60 * 60 * 1000,
    ); // intervalo de 12 horas (em ms)
    //adicionar horário fixo pra ele mandar

    
    setInterval(
      () => {
        checarAniversarios(client);
      },
      24 * 60 * 60 * 1000,
    );
    deploy();
  },
};
