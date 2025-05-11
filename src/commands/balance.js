const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balances")
        .setDescription("Fetch everyone's current balances"),
    
    execute: async (interaction) => {
        try {
            console.log("Fetching balances...");
            const response = await axios.get(process.env.BALANCE_HOOK);
            const balances = response.data;
            
            console.log("Balances fetched successfully:", balances);
            const embed = new EmbedBuilder()
                .setTitle("💰 Current Balances")
                .setThumbnail("https://i.pinimg.com/736x/0a/88/34/0a8834c41478a60c20365515803d4e14.jpg") 
                .setColor(0x00AE86)
                .setDescription(balances.map(entry => `**${entry.name}**: $${entry.balance.toFixed(2)}`).join("\n\n"))
                .setFooter({ text: `👀 bruh idk what to put here` });
            
            console.log("Sending embed...");

            await interaction.reply({ embeds: [embed] });
            console.log("Embed sent successfully.");
        } catch (error) {
            console.error(error);
            await interaction.reply("❌ Failed to fetch balances.");
        }
    }
};