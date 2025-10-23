const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Reloads a command.")
		.addStringOption((option) =>
			option
				.setName("command")
				.setDescription("The command to reload.")
				.setRequired(true),
		),
	async execute(interaction) {
		const commandName = interaction.options
			.getString("command", true)
			.toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(
				`There is no command with name \`${commandName}\`!`,
			);
		}

		let reloadedCommand;
		const foldersPath = path.join(__dirname, "..");
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs
				.readdirSync(commandsPath)
				.filter((file) => file.endsWith(".js"));

			for (const file of commandFiles) {
				if (file.replace(".js", "") === commandName) {
					const filePath = path.join(commandsPath, file);
					delete require.cache[require.resolve(filePath)];
					reloadedCommand = require(filePath);
					break;
				}
			}
		}

		if (!reloadedCommand) {
			return interaction.reply(`Could not reload \`${commandName}\`!`);
		}

		interaction.client.commands.set(reloadedCommand.data.name, reloadedCommand);
		await interaction.reply(
			`Command \`${reloadedCommand.data.name}\` was reloaded!`,
		);
	},
};
