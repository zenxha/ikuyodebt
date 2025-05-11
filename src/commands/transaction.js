const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const namesFilePath = path.join(__dirname, '..', 'users.json');
const json = JSON.parse(fs.readFileSync(namesFilePath, 'utf8'));
const names = json.users;

// Map names to choices
const choices = names.map(user => ({ name: user.name, value: user.name }));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("transaction")
        .setDescription("Record a transaction")
        .addStringOption(option =>
            option.setName("payer")  
            .setDescription("Who paid?")
            .setRequired(true)
            .addChoices(...choices)
        )
        .addStringOption(option =>
            option.setName("payee")  
            .setDescription("Who received payment? (i.e was paid for at costco)")
            .setRequired(true)
            .addChoices(...choices)
        )
        .addNumberOption(option =>
            option.setName("amount")
            .setDescription("How much was paid?")
            .setRequired(true)
            .setMinValue(0.01)
        )
        .addStringOption(option =>
            option.setName("details")
            .setDescription("What is this for")
            .setRequired(true)
        ),
    
    execute: async (interaction) => {
        const payer = interaction.options.getString("payer");
        const amount = interaction.options.getNumber("amount");
        const payee = interaction.options.getString("payee");
        const details = interaction.options.getString("details");
        const detailsPrint = '```\n' + details + '\n```';

        try {
            await axios.post(process.env.TRANSACTION_HOOK, { payer, payee, amount, details });
            await interaction.reply(`✅ Transaction recorded: **${payer} paid ${payee} $${amount}** ${detailsPrint}`);
        } catch (error) {
            console.error(error);
            await interaction.reply("❌ Failed to record transaction.");
        }
    }
};