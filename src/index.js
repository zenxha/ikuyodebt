const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Collection } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("Slash commands registered!");
  } catch (error) {
    console.error(error);
  }
})();

// const whitelist = ['171101210030505987', '303901005710360576', '442837063432142851', '394366832037068800', '529497274435371018']; // Replace with actual user IDs
const whitelist = JSON.parse(fs.readFileSync(path.join(__dirname, "users.json"), "utf8")).whitelist;

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  if (command.data.name === "transaction" && !whitelist.includes(interaction.user.id)) {
    return interaction.reply("❌ You are not authorized to use this command.");
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "❌ There was an error while executing this command!", ephemeral: true });
  }

});

client.login(process.env.DISCORD_TOKEN);