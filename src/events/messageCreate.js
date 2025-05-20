module.exports = {
    name: 'messageCreate',
    execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Ping command
        if (message.content.toLowerCase() === '!ping') {
            message.reply('Pong! 🏓');
            return;
        }

        // Help command (works with both '!help' and 'help')
        if (message.content.toLowerCase() === '!help' || 
            message.content.toLowerCase() === 'help') {
            
            const commandList = [
                "**!ping** - Get a pong response",
                "**help** - Show this help message"
            ].join('\n');

            message.reply({
                embeds: [{
                    title: "Available Commands",
                    description: commandList,
                    color: 0x3498db,
                    timestamp: new Date()
                }]
            });
        }
    }
};