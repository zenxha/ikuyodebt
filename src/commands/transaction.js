const { SlashCommandBuilder } = require('@discordjs');
const fs = require('fs');
const path = require('path');

const namesFilePath = path.join(__dirname, 'names.json');
const names = JSON.parse(fs.readFileSync(namesFilePath, 'utf8'));

// Map names to choices
const choices = names.map(name => ({ name, value: name }));

module.exports = new SlashCommandBuilder()
    .setName("transaction")
    .setDescription("Record a transaction")
    .addStringOption(option =>
        option.setName("Payer")
        .setDescription("Who paid?")
        .setRequired(true)
        .addChoices(...choices)
    )
    .addStringOption(option =>
        option.setName("Payee")
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
        option.setName("details").setDescription("What is this for")
    )
    ;