const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("recent")
        .setDescription("Fetch the most recent transactions"),
    
    execute: async (interaction) => {
        try {
            console.log("Fetching recent transactions...");
            const response = await axios.get(process.env.RECENT_HOOK);
            const transactions = response.data;
            console.log(transactions)
            

            console.log("Transactions fetched successfully:", transactions);
            const embed = new EmbedBuilder()
                .setTitle("🧾 Recent Transactions")
                .setThumbnail("https://i.pinimg.com/736x/6c/f7/96/6cf79699a2f2f492fae83c1708730d15.jpg") 
                .setColor("#c48bdf")

            
            transactions.forEach(entry => {
                embed.addFields({ name: `${entry.payer} paid ${entry.payee}`, value: `**$${entry.amount}** for ${entry.details}` });
            })

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply("❌ Failed to fetch recent transactions.");
        }
    }
};