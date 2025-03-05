const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
});

const commands = [
  new SlashCommandBuilder()
    .setName("transaction")
    .setDescription("Record a transaction")
    .addStringOption(option =>
      option.setName("payer")
        .setDescription("Who owes?")
        .setRequired(true)
        .addChoices(
          { name: 'AnPhu', value: 'AnPhu' },
          { name: 'Andy', value: 'Andy' },
          { name: 'Gryphon', value: 'Gryphon' },
          { name: 'Komay', value: 'Komay' },
          { name: 'Ting', value: 'Ting' },
        ))
    .addStringOption(option =>
      option.setName("payee")
        .setDescription("Who paid?")
        .setRequired(true)
        .addChoices(
          { name: 'AnPhu', value: 'AnPhu' },
          { name: 'Andy', value: 'Andy' },
          { name: 'Gryphon', value: 'Gryphon' },
          { name: 'Komay', value: 'Komay' },
          { name: 'Ting', value: 'Ting' },
        ))
    .addNumberOption(option =>
      option.setName("amount").setDescription("How much?").setRequired(true))
    .addStringOption(option =>
      option.setName("details").setDescription("What is the debt for?").setRequired(true)),
  new SlashCommandBuilder()
      .setName("balances")
      .setDescription("Fetch everyone's current balances")

].map(command => command.toJSON());

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

const whitelist = ['171101210030505987', '303901005710360576', '442837063432142851', '394366832037068800', '529497274435371018']; // Replace with actual user IDs

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (!whitelist.includes(interaction.user.id)) {
    await interaction.reply("❌ You are not authorized to use this command.");
    return;
  }
  if (interaction.commandName === "transaction") {
    const payer = interaction.options.getString("payer");
    const amount = interaction.options.getNumber("amount");
    const payee = interaction.options.getString("payee");
    const details = interaction.options.getString("details");
    const detailsPrint = '```\n' + details + '\n```';

    try {
      await require("axios").post(process.env.TRANSACTION_HOOK, { payer, payee, amount, details });
      console.log('a');
      await interaction.reply(`✅ Transaction recorded: **${payer} paid ${payee} $${amount}** ${detailsPrint}`);
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Failed to record transaction.");
    }
  }

  if (interaction.commandName === "balances") {
    try {
      const response = await require("axios").get(process.env.BALANCE_HOOK); // Web App URL
      const balances = response.data;
      console.log(balances);


    const embed = new EmbedBuilder()
      .setTitle("💰 Current Balances")
      .setThumbnail("https://i.pinimg.com/736x/0a/88/34/0a8834c41478a60c20365515803d4e14.jpg") // Replace with your thumbnail URL
      .setColor(0x00AE86)
      .setDescription(balances.map(entry => `**${entry.name}**: $${entry.balance.toFixed(2)}`).join("\n\n"))
      .setFooter({ text: `👀` });

    await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Failed to fetch balances.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);