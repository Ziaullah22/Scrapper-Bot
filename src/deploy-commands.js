const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('fs');
const path = require('path');

// Collect all command files
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command for deploy: ${command.data.name}`);
    } else {
        console.warn(`⚠️ Skipped "${file}": missing "data" or "execute".`);
    }
}

// Create REST instance
const rest = new REST({ version: '10' }).setToken(token);

// Deploy commands
(async () => {
    try {
        console.log(`🔃 Refreshing ${commands.length} application (/) commands in guild ${guildId}...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} commands.`);
    } catch (error) {
        console.error('❌ Failed to deploy commands:', error);
    }
})();
