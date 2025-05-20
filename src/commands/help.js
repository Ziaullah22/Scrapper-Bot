const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands'),
    async execute(interaction) {
        const commands = interaction.client.commands;
        const commandList = Array.from(commands.values()).map(cmd => {
            return `**/${cmd.data.name}** - ${cmd.data.description}`;
        }).join('\n') || 'No commands available';

        await interaction.reply({
            embeds: [{
                title: 'Available Commands',
                description: commandList,
                color: 0x0099FF,
                timestamp: new Date()
            }],
            flags: MessageFlags.FLAGS.EPHEMERAL  // ← Fixed here
        });
    }
};