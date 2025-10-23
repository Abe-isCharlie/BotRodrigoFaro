const { REST, Routes } = require("discord.js");
const { TOKEN, clientID, guildID } = process.env; // guildID é o ID do servidor de testes
const fs = require("node:fs");
const path = require("node:path");

function deploy() {
  const commands = [];
  const guildCommands = [];

  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ("data" in command && "execute" in command) {
        // saporra só pra deixar em um server de teste
        if (
          command.data.name === "testejogos" ||
          command.data.name === "reload"
        ) {
          // adiciona os comandos 'testejogos' e 'reload' no servidor de testes
          guildCommands.push(command.data.toJSON());
        } else {
          // os outros comandos(só tem o pingkkkkkkk)
          commands.push(command.data.toJSON());
        }
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  const rest = new REST().setToken(TOKEN);

  (async () => {
    try {
      // Registrando os globais
      console.log(
        `Started refreshing ${commands.length} global application (/) commands.`
      );
      const globalData = await rest.put(Routes.applicationCommands(clientID), {
        body: commands,
      });
      console.log(
        `Successfully reloaded ${globalData.length} global commands.`
      );

      // Registrando comandos de teste
      console.log(
        `Started refreshing ${guildCommands.length} guild-specific (/) commands.`
      );
      const guildData = await rest.put(
        Routes.applicationGuildCommands(clientID, guildID),
        { body: guildCommands }
      );
      console.log(
        `Successfully reloaded ${guildData.length} guild-specific commands.`
      );
    } catch (error) {
      console.error(error);
    }
  })();
}

module.exports = deploy;
